# 📦 Notebook 数据库备份与还原指南

**最后更新**: 2026-03-10
**版本**: 1.0.0

---

## 📋 目录

1. [备份位置](#备份位置)
2. [手动备份](#手动备份)
3. [自动备份](#自动备份)
4. [还原数据库](#还原数据库)
5. [备份策略](#备份策略)
6. [常见问题](#常见问题)

---

## 备份位置

数据库备份文件存放在：

```
/home/ubuntu-user/.openclaw/project/notebook/docs/db/
```

备份文件命名格式：
```
notebook_backup_YYYYMMDD_HHMMSS.sql
```

示例：
```
notebook_backup_20260310_112855.sql
```

---

## 手动备份

### 方法一：使用 mysqldump 命令

```bash
# 进入项目目录
cd /home/ubuntu-user/.openclaw/project/notebook

# 创建备份目录（如果不存在）
mkdir -p docs/db

# 执行备份
docker exec notebook-mysql mysqldump -u root -pNotebookRoot2026! notebook > docs/db/notebook_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 方法二：使用备份脚本

创建备份脚本 `scripts/backup.sh`：

```bash
#!/bin/bash

# Notebook 数据库备份脚本

# 配置
BACKUP_DIR="/home/ubuntu-user/.openclaw/project/notebook/docs/db"
CONTAINER_NAME="notebook-mysql"
DB_NAME="notebook"
DB_USER="root"
DB_PASS="NotebookRoot2026!"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 生成备份文件名
BACKUP_FILE="$BACKUP_DIR/notebook_backup_$(date +%Y%m%d_%H%M%S).sql"

# 执行备份
echo "开始备份数据库..."
docker exec $CONTAINER_NAME mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_FILE

# 检查备份是否成功
if [ $? -eq 0 ]; then
    echo "✅ 备份成功：$BACKUP_FILE"
    # 显示备份文件大小
    ls -lh $BACKUP_FILE
else
    echo "❌ 备份失败！"
    exit 1
fi
```

使用脚本：
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

---

## 自动备份

### 使用 Cron 定时备份

编辑 crontab：
```bash
crontab -e
```

添加每日备份任务（每天凌晨 2 点）：
```bash
0 2 * * * /home/ubuntu-user/.openclaw/project/notebook/scripts/backup.sh
```

### 使用 Docker 备份卷

备份整个 MySQL 数据卷：
```bash
# 停止容器（可选，建议停止以确保数据一致性）
docker stop notebook-mysql

# 备份数据卷
docker run --rm \
  -v notebook_mysql_data:/source \
  -v $(pwd)/docs/db/volume_backup:/backup \
  alpine tar czf /backup/mysql_data_$(date +%Y%m%d).tar.gz -C /source .

# 启动容器
docker start notebook-mysql
```

---

## 还原数据库

### 方法一：从 SQL 备份文件还原

```bash
# 进入项目目录
cd /home/ubuntu-user/.openclaw/project/notebook

# 选择要还原的备份文件
BACKUP_FILE="docs/db/notebook_backup_20260310_112855.sql"

# 还原数据库
docker exec -i notebook-mysql mysql -u root -pNotebookRoot2026! notebook < $BACKUP_FILE
```

### 方法二：从数据卷备份还原

```bash
# 停止容器
docker stop notebook-mysql

# 清空现有数据卷
docker volume rm notebook_mysql_data
docker volume create notebook_mysql_data

# 还原数据卷
docker run --rm \
  -v notebook_mysql_data:/target \
  -v $(pwd)/docs/db/volume_backup:/backup \
  alpine tar xzf /backup/mysql_data_20260310.tar.gz -C /target

# 启动容器
docker start notebook-mysql
```

### 方法三：使用还原脚本

创建还原脚本 `scripts/restore.sh`：

```bash
#!/bin/bash

# Notebook 数据库还原脚本

# 配置
BACKUP_DIR="/home/ubuntu-user/.openclaw/project/notebook/docs/db"
CONTAINER_NAME="notebook-mysql"
DB_NAME="notebook"
DB_USER="root"
DB_PASS="NotebookRoot2026!"

# 显示可用备份
echo "可用的备份文件："
ls -lh $BACKUP_DIR/*.sql
echo ""

# 选择备份文件
read -p "请输入要还原的备份文件名（如：notebook_backup_20260310_112855.sql）: " BACKUP_FILE

# 检查文件是否存在
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "❌ 备份文件不存在！"
    exit 1
fi

# 确认还原
echo "⚠️  警告：此操作将覆盖当前数据库！"
read -p "确定要还原数据库吗？(yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "已取消还原操作"
    exit 0
fi

# 执行还原
echo "开始还原数据库..."
docker exec -i $CONTAINER_NAME mysql -u $DB_USER -p$DB_PASS $DB_NAME < $BACKUP_DIR/$BACKUP_FILE

# 检查还原是否成功
if [ $? -eq 0 ]; then
    echo "✅ 还原成功！"
else
    echo "❌ 还原失败！"
    exit 1
fi
```

使用脚本：
```bash
chmod +x scripts/restore.sh
./scripts/restore.sh
```

---

## 备份策略

### 推荐备份计划

| 备份类型 | 频率 | 保留时间 | 存储位置 |
|----------|------|----------|----------|
| 完整备份 | 每日 | 7 天 | 本地 docs/db/ |
| 完整备份 | 每周 | 4 周 | 外部存储/云存储 |
| 完整备份 | 每月 | 12 月 | 外部存储/云存储 |

### 备份文件管理

#### 清理旧备份

创建清理脚本 `scripts/cleanup.sh`：

```bash
#!/bin/bash

# 清理 7 天前的备份文件
BACKUP_DIR="/home/ubuntu-user/.openclaw/project/notebook/docs/db"

echo "清理 7 天前的备份文件..."
find $BACKUP_DIR -name "notebook_backup_*.sql" -mtime +7 -delete

echo "✅ 清理完成"
```

添加到 crontab（每周日凌晨 3 点）：
```bash
0 3 * * 0 /home/ubuntu-user/.openclaw/project/notebook/scripts/cleanup.sh
```

### 备份验证

定期验证备份文件的有效性：

```bash
# 检查备份文件是否完整
BACKUP_FILE="docs/db/notebook_backup_20260310_112855.sql"

# 检查文件大小（应该大于 0）
if [ -s $BACKUP_FILE ]; then
    echo "✅ 备份文件大小正常"
else
    echo "❌ 备份文件为空！"
    exit 1
fi

# 检查文件内容（应该包含 SQL 语句）
if grep -q "CREATE TABLE" $BACKUP_FILE; then
    echo "✅ 备份文件内容正常"
else
    echo "❌ 备份文件内容异常！"
    exit 1
fi
```

---

## 常见问题

### Q1: 备份文件在哪里？
A: 备份文件存放在 `docs/db/` 目录下，文件名格式为 `notebook_backup_YYYYMMDD_HHMMSS.sql`

### Q2: 如何查看备份文件内容？
A: 使用文本编辑器或 `cat` 命令查看：
```bash
cat docs/db/notebook_backup_20260310_112855.sql
```

### Q3: 备份文件太大怎么办？
A: 可以使用 gzip 压缩：
```bash
docker exec notebook-mysql mysqldump -u root -pNotebookRoot2026! notebook | gzip > docs/db/notebook_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Q4: 还原时提示数据库不存在？
A: 先创建数据库：
```bash
docker exec -i notebook-mysql mysql -u root -pNotebookRoot2026! -e "CREATE DATABASE IF NOT EXISTS notebook;"
```

### Q5: 如何备份到云存储？
A: 可以使用 rclone 等工具同步到云存储：
```bash
# 安装 rclone 后
rclone sync docs/db/ remote:backup/notebook/
```

### Q6: 忘记密码怎么办？
A: 重置 MySQL root 密码：
```bash
# 进入容器
docker exec -it notebook-mysql bash

# 修改密码
mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';"
```

---

## 快速参考

### 备份命令
```bash
docker exec notebook-mysql mysqldump -u root -pNotebookRoot2026! notebook > docs/db/notebook_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 还原命令
```bash
docker exec -i notebook-mysql mysql -u root -pNotebookRoot2026! notebook < docs/db/notebook_backup_YYYYMMDD_HHMMSS.sql
```

### 查看备份列表
```bash
ls -lh docs/db/*.sql
```

### 检查数据库状态
```bash
docker exec -it notebook-mysql mysql -u root -pNotebookRoot2026! -e "SHOW DATABASES;"
```

---

## 相关文档

- [部署文档](./deployment.md)
- [快速开始](../QUICKSTART.md)
- [架构文档](./architecture.md)

---

**文档维护**: Notebook 团队
**最后更新**: 2026-03-10
