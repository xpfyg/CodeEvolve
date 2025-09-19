#!/bin/bash

# CodeEvolve 自举系统启动脚本

set -e

echo "🚀 启动 CodeEvolve 自举系统"

# 项目根目录
PROJECT_ROOT="/Users/chihuan/Documents/CodeEvolve"
cd "$PROJECT_ROOT"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖项..."

    # 检查Go
    if command -v go >/dev/null 2>&1; then
        log_success "Go已安装: $(go version)"
    else
        log_error "Go未安装，请先安装Go"
        exit 1
    fi

    # 检查Docker
    if command -v docker >/dev/null 2>&1; then
        if docker ps >/dev/null 2>&1; then
            log_success "Docker运行正常"
        else
            log_warning "Docker未运行，沙箱功能将不可用"
        fi
    else
        log_warning "Docker未安装，沙箱功能将不可用"
    fi

    # 检查Python
    if command -v python3 >/dev/null 2>&1; then
        log_success "Python3已安装: $(python3 --version)"
    else
        log_warning "Python3未安装，AI功能将不可用"
    fi
}

# 构建沙箱镜像
build_sandbox_image() {
    log_info "构建沙箱镜像..."

    if command -v docker >/dev/null 2>&1 && docker ps >/dev/null 2>&1; then
        cd backend/internal/bootstrap/sandbox

        if docker build -t codeevolve/sandbox:latest .; then
            log_success "沙箱镜像构建成功"
        else
            log_warning "沙箱镜像构建失败"
        fi

        cd "$PROJECT_ROOT"
    else
        log_warning "跳过沙箱镜像构建（Docker不可用）"
    fi
}

# 初始化Go模块
init_go_module() {
    log_info "初始化Go模块..."

    cd backend

    if [ ! -f "go.mod" ]; then
        go mod init github.com/your-org/CodeEvolve/backend
        log_success "Go模块已初始化"
    fi

    # 添加必要的依赖
    go get github.com/gin-gonic/gin
    go get github.com/google/go-github/v57/github
    go get github.com/go-git/go-git/v5
    go get golang.org/x/oauth2
    go get github.com/docker/docker/client
    go get github.com/google/uuid
    go get gopkg.in/yaml.v3

    go mod tidy
    log_success "Go依赖已安装"

    cd "$PROJECT_ROOT"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."

    directories=(
        "logs"
        "backups"
        "temp"
        "data"
    )

    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            mkdir -p "$dir"
            log_success "目录已创建: $dir"
        fi
    done
}

# 检查配置文件
check_config() {
    log_info "检查配置文件..."

    config_file="configs/bootstrap-config.yml"
    if [ -f "$config_file" ]; then
        log_success "配置文件存在: $config_file"

        # 检查环境变量
        if [ -n "$OPENAI_API_KEY" ]; then
            log_success "OPENAI_API_KEY已设置"
        else
            log_warning "OPENAI_API_KEY未设置，AI功能将不可用"
        fi

        if [ -n "$GITHUB_TOKEN" ]; then
            log_success "GITHUB_TOKEN已设置"
        else
            log_warning "GITHUB_TOKEN未设置，GitHub集成将不可用"
        fi
    else
        log_error "配置文件不存在: $config_file"
        exit 1
    fi
}

# 启动服务
start_service() {
    log_info "启动自举系统服务..."

    cd backend

    # 构建应用
    if go build -o bootstrap cmd/bootstrap/main.go; then
        log_success "应用构建成功"
    else
        log_error "应用构建失败"
        exit 1
    fi

    # 启动服务
    log_info "启动服务在端口 8081..."
    ./bootstrap --config="../configs/bootstrap-config.yml" --port=8081 --debug
}

# 主流程
main() {
    echo "=========================================="
    echo "🤖 CodeEvolve 自举系统启动器"
    echo "=========================================="

    check_dependencies
    init_go_module
    build_sandbox_image
    create_directories
    check_config
    start_service
}

# 信号处理
cleanup() {
    log_info "正在关闭服务..."
    # 这里可以添加清理逻辑
    exit 0
}

trap cleanup SIGINT SIGTERM

# 解析命令行参数
SKIP_BUILD=false
SKIP_DOCKER=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-docker)
            SKIP_DOCKER=true
            shift
            ;;
        --help)
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  --skip-build    跳过Go应用构建"
            echo "  --skip-docker   跳过Docker镜像构建"
            echo "  --help          显示帮助信息"
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            exit 1
            ;;
    esac
done

# 运行主流程
main