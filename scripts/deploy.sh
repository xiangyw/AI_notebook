#!/bin/bash

# ===========================================
# Notebook 快速部署脚本
# ===========================================

set -e

echo "🚀 Notebook 快速部署脚本"
echo "========================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_DIR="/home/ubuntu-user/.openclaw/project/notebook"
DOCKER_DIR="/home/ubuntu-user/docker/notebook"

echo "📁 项目目录：$PROJECT_DIR"
echo ""

# 检查 Docker
echo "🔍 检查 Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装！${NC}"
    echo ""
    echo "请先安装 Docker："
    echo ""
    echo "  # Ubuntu/Debian"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "  sudo sh get-docker.sh"
    echo ""
    echo "  # 或者"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install -y docker.io docker-compose-plugin"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Docker 已安装：$(docker --version)${NC}"

# 检查 Docker Compose
if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose 未安装！${NC}"
    echo ""
    echo "请安装 Docker Compose："
    echo ""
    echo "  sudo apt-get install -y docker-compose-plugin"
    echo ""
    exit 1
fi

if command -v docker compose &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo -e "${GREEN}✅ Docker Compose 已安装${NC}"
echo ""

# 创建数据目录
echo "📂 创建数据目录..."
sudo mkdir -p $DOCKER_DIR/{mysql,data}
sudo chown -R 1000:1000 $DOCKER_DIR
echo -e "${GREEN}✅ 数据目录已创建：$DOCKER_DIR${NC}"
echo ""

# 进入项目目录
cd $PROJECT_DIR

# 复制环境变量
if [ ! -f .env ]; then
    echo "📝 创建环境变量..."
    cp .env.example .env
    echo -e "${GREEN}✅ .env 已创建${NC}"
    echo ""
else
    echo -e "${YELLOW}⚠️  .env 已存在，跳过${NC}"
    echo ""
fi

# 构建并启动
echo "🔨 构建 Docker 镜像..."
$COMPOSE_CMD build

echo ""
echo "🚀 启动服务..."
$COMPOSE_CMD up -d

echo ""
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo ""
echo "📊 服务状态:"
$COMPOSE_CMD ps

echo ""
echo "🧪 健康检查..."

# 检查应用
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo -e "${GREEN}✅ 应用服务正常${NC}"
else
    echo -e "${YELLOW}⚠️  应用服务未就绪，请稍后检查日志${NC}"
fi

echo ""
echo "========================"
echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo "📱 访问地址：http://localhost:3000"
echo "🗄️  MySQL 端口：localhost:3306"
echo ""
echo "常用命令:"
echo "  查看日志：$COMPOSE_CMD logs -f"
echo "  停止服务：$COMPOSE_CMD down"
echo "  重启服务：$COMPOSE_CMD restart"
echo ""
