# Notebook 部署文档

**版本**: 1.0  
**创建日期**: 2026-03-07  
**最后更新**: 2026-03-07

---

## 📋 目录

1. [环境要求](#环境要求)
2. [安装 Docker](#安装 -docker)
3. [部署步骤](#部署步骤)
4. [启动应用](#启动应用)
5. [验证部署](#验证部署)
6. [常用命令](#常用命令)
7. [故障排查](#故障排查)
8. [生产环境配置](#生产环境配置)

---

## 环境要求

| 组件 | 版本 | 说明 |
|------|------|------|
| Docker | 20.10+ | 容器运行时 |
| Docker Compose | 2.0+ | 容器编排 |
| 内存 | ≥ 2GB | 推荐 4GB+ |
| 磁盘 | ≥ 5GB | 含 MySQL 数据 |
| 端口 | 3000, 3306 | 应用和数据库 |

---

## 安装 Docker

### Ubuntu/Debian

```bash
# 一键安装脚本（需要 sudo 权限）
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 或者使用 apt 安装
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-plugin

# 验证安装
docker --version
docker compose version

# 添加当前用户到 docker 组（可选，避免每次都用 sudo）
sudo usermod -aG docker $USER
newgrp docker
```

### CentOS/RHEL

```bash
sudo yum install -y docker docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

### macOS

下载 Docker Desktop: https://www.docker.com/products/docker-desktop/

### Windows

下载 Docker Desktop: https://www.docker.com/products/docker-desktop/

---

## 部署步骤

### 1. 准备项目

```bash
# 进入项目目录
cd /home/ubuntu-user/.openclaw/project/notebook

# 确认文件结构
ls -la
# 应该看到：
# - docker-compose.yml
# - docker/
# - client/
# - server/
# - docs/
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量（可选，使用默认值可跳过）
vim .env

# 默认配置：
# MYSQL_ROOT_PASSWORD=notebook_root_2026
# DB_PASSWORD=notebook_user_2026
# NODE_ENV=production
```

### 3. 创建数据目录

```bash
# 创建 Docker 数据卷目录（统一存储位置）
sudo mkdir -p /home/ubuntu-user/docker/notebook/{mysql,data}

# 设置权限
sudo chown -R 1000:1000 /home/ubuntu-user/docker/notebook
```

### 4. 构建并启动

```bash
# 方式一：使用 docker compose (Docker 20.10+)
docker compose up -d --build

# 方式二：使用 docker-compose (旧版本)
docker-compose up -d --build
```

---

## 启动应用

### 首次启动

```bash
# 进入项目目录
cd /home/ubuntu-user/.openclaw/project/notebook

# 启动所有服务（后台运行）
docker compose up -d

# 查看启动日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f app
docker compose logs -f mysql
```

### 重启服务

```bash
# 重启所有服务
docker compose restart

# 重启单个服务
docker compose restart app
docker compose restart mysql
```

### 停止服务

```bash
# 停止所有服务（保留数据）
docker compose down

# 停止并删除数据卷（危险！会删除所有数据）
docker compose down -v
```

---

## 验证部署

### 1. 检查容器状态

```bash
# 查看运行中的容器
docker compose ps

# 应该看到：
# NAME                STATUS         PORTS
# notebook-app        Up (healthy)   0.0.0.0:3000->3000/tcp
# notebook-mysql      Up (healthy)   0.0.0.0:3306->3306/tcp
```

### 2. 测试应用 API

```bash
# 健康检查
curl http://localhost:3000/api/health

# 预期响应：
# {"status":"ok","timestamp":"2026-03-07T12:00:00.000Z"}
```

### 3. 测试笔记 API

```bash
# 创建笔记
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试笔记",
    "content": "# Hello World\n\n这是第一篇笔记！"
  }'

# 获取笔记列表
curl http://localhost:3000/api/notes

# 获取单个笔记
curl http://localhost:3000/api/notes/20260307-001

# 搜索笔记
curl "http://localhost:3000/api/search?q=测试"

# 获取统计信息
curl http://localhost:3000/api/meta/stats
```

### 4. 访问 Web 界面

打开浏览器访问：**http://localhost:3000**

应该看到 Notebook 应用界面：
- 左侧：笔记列表
- 中间：编辑器
- 右侧：预览区

### 5. 检查数据库

```bash
# 进入 MySQL 容器
docker compose exec mysql mysql -u notebook -pnotebook_user_2026 notebook

# 查看表结构
SHOW TABLES;

# 查看笔记数据
SELECT * FROM notes;

# 退出
EXIT;
```

---

## 常用命令

### 容器管理

```bash
# 查看容器状态
docker compose ps

# 查看容器日志
docker compose logs -f

# 进入容器
docker compose exec app bash
docker compose exec mysql bash

# 重启容器
docker compose restart

# 停止容器
docker compose stop

# 启动容器
docker compose start
```

### 构建管理

```bash
# 重新构建镜像
docker compose build

# 强制重新构建（无缓存）
docker compose build --no-cache

# 查看镜像
docker compose images
```

### 数据管理

```bash
# 备份 MySQL 数据
docker compose exec mysql mysqldump -u notebook -pnotebook_user_2026 notebook > backup.sql

# 恢复 MySQL 数据
docker compose exec -T mysql mysql -u notebook -pnotebook_user_2026 notebook < backup.sql

# 查看数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect notebook_mysql_data
```

### 清理命令

```bash
# 清理停止的容器
docker compose down

# 清理悬空镜像
docker image prune -f

# 清理所有未使用的镜像
docker image prune -a -f

# ⚠️ 危险！删除所有数据卷
docker compose down -v
```

---

## 故障排查

### 问题 1: 容器启动失败

```bash
# 查看详细日志
docker compose logs app
docker compose logs mysql

# 检查配置
docker compose config

# 重新构建
docker compose up -d --build --force-recreate
```

### 问题 2: MySQL 连接失败

```bash
# 检查 MySQL 是否健康
docker compose ps mysql

# 查看 MySQL 日志
docker compose logs mysql

# 进入 MySQL 容器
docker compose exec mysql mysql -u root -p

# 检查数据库用户
SELECT user, host FROM mysql.user;
```

### 问题 3: 端口被占用

```bash
# 查看端口占用
sudo lsof -i :3000
sudo lsof -i :3306

# 修改 docker-compose.yml 中的端口映射
# 例如：3001:3000 代替 3000:3000
```

### 问题 4: 权限问题

```bash
# 修复数据目录权限
sudo chown -R 1000:1000 /home/ubuntu-user/docker/notebook

# 重新创建容器
docker compose down
docker compose up -d
```

### 问题 5: 应用无法访问数据库

```bash
# 检查网络连接
docker compose exec app ping mysql

# 检查环境变量
docker compose exec app env | grep DB

# 测试数据库连接
docker compose exec app node -e "
const mysql = require('mysql2/promise');
(async () => {
  const conn = await mysql.createConnection({
    host: 'mysql',
    user: 'notebook',
    password: 'notebook_user_2026',
    database: 'notebook'
  });
  await conn.ping();
  console.log('Database connected!');
  await conn.end();
})();
"
```

---

## 生产环境配置

### 1. 环境变量

创建 `.env.production`：

```bash
# 生产环境配置
NODE_ENV=production
MYSQL_ROOT_PASSWORD=<强密码>
DB_PASSWORD=<强密码>
JWT_SECRET=<强随机字符串>
```

### 2. 使用生产配置启动

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 3. HTTPS 配置

使用 Nginx 反向代理：

```bash
# docker-compose.prod.yml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
```

### 4. 日志管理

```bash
# 配置日志驱动（docker-compose.yml）
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 5. 资源限制

```bash
# 限制容器资源
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
```

---

## 快速参考卡片

```bash
# =====================
# 部署
# =====================
cd /home/ubuntu-user/.openclaw/project/notebook
docker compose up -d --build

# =====================
# 查看状态
# =====================
docker compose ps
docker compose logs -f

# =====================
# API 测试
# =====================
curl http://localhost:3000/api/health
curl http://localhost:3000/api/notes
curl "http://localhost:3000/api/search?q=测试"

# =====================
# 停止
# =====================
docker compose down

# =====================
# 重启
# =====================
docker compose restart
```

---

## 附录

### A. 项目文件结构

```
notebook/
├── docker-compose.yml       # Docker 编排配置
├── docker/
│   ├── app/
│   │   └── Dockerfile       # 应用镜像构建
│   └── mysql/
│       └── init.sql         # 数据库初始化脚本
├── client/                   # 前端代码
├── server/                   # 后端代码
├── docs/                     # 文档
│   ├── deployment.md         # 部署文档（本文件）
│   ├── architecture.md       # 技术架构
│   └── prd.md               # 产品需求
└── .env.example              # 环境变量模板
```

### B. 数据卷映射

| 宿主机路径 | 容器路径 | 用途 |
|-----------|---------|------|
| `/home/ubuntu-user/docker/notebook/mysql/data` | `/var/lib/mysql` | MySQL 数据 |
| `/home/ubuntu-user/docker/notebook/data` | `/app/data` | 应用数据（笔记文件） |

### C. 端口映射

| 服务 | 宿主机端口 | 容器端口 | 说明 |
|------|-----------|---------|------|
| App | 3000 | 3000 | Web 应用 |
| MySQL | 3306 | 3306 | 数据库 |

---

**文档结束**

*最后更新：2026-03-07*
