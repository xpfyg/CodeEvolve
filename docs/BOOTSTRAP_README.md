# CodeEvolve 自举系统

## 🎯 概述

CodeEvolve 自举系统是一个AI驱动的代码自我进化平台，能够理解、分析并安全地修改自身代码，与GitHub Issues工作流无缝集成，形成完整的自我优化闭环。

## ✨ 核心功能

### 🧠 自我认知能力
- **AST解析**: 支持Go和TypeScript代码的深度语法分析
- **元数据提取**: 自动提取函数、结构体、接口、依赖关系等信息
- **架构理解**: 构建项目的组件树和依赖图谱

### 🔒 分层安全保护
- **核心层保护**: 关键系统模块需要管理员权限
- **保护层审核**: 重要文件修改需要人工审核
- **扩展层自由**: 业务逻辑层支持自动修改
- **恶意代码检测**: 多模式检测潜在安全风险

### 🏗️ 沙箱执行环境
- **Docker隔离**: 完全隔离的代码执行环境
- **资源限制**: 内存、CPU、网络访问控制
- **自动测试**: 支持Go、Node.js、Python测试框架
- **安全扫描**: 代码质量和安全问题检测

### 🔄 自动回滚机制
- **快照备份**: 修改前自动创建文件快照
- **Git集成**: 基于Git的版本控制和回滚
- **紧急恢复**: 一键恢复到最近可用状态
- **审计日志**: 完整的修改历史记录

### 🐙 GitHub工作流集成
- **Issue解析**: 自动解析GitHub Issue需求
- **PR生成**: 自动创建Pull Request
- **状态同步**: 实时更新Issue和PR状态
- **标签管理**: 智能添加相关标签

## 🏗️ 系统架构

```
┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐
│    Self-Aware Layer     │    │   Modification Engine   │    │   Verification Layer   │
│   (自我认知层)            │◄──►│    (修改引擎层)           │◄──►│    (验证层)              │
└─────────────────────────┘    └─────────────────────────┘    └─────────────────────────┘
│                               │                               │
│ - Go AST Parser             │ - Code Generator            │ - 单元测试                 │
│ - TypeScript Parser         │ - Conflict Resolver         │ - 集成测试                 │
│ - Meta Model Builder        │ - Safety Checker            │ - E2E 测试                │
│ - Dependency Graph          │ - Backup Manager            │ - 安全扫描                │
└───────────────────────────────┼───────────────────────────────┼───────────────────────────┘
                                │                               │
┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐
│   GitHub Integration    │    │    Sandbox Layer       │    │   Core Protection       │
│   (GitHub 集成层)        │    │     (沙箱层)             │    │    (核心保护层)           │
└─────────────────────────┘    └─────────────────────────┘    └─────────────────────────┘
```

## 🚀 快速开始

### 1. 环境准备

```bash
# 安装依赖
go version  # >= 1.21
docker --version  # 用于沙箱环境
python3 --version  # >= 3.9

# 设置环境变量
export OPENAI_API_KEY="your_openai_api_key"
export GITHUB_TOKEN="your_github_token"
```

### 2. 运行测试

```bash
# 运行系统测试
./scripts/test-bootstrap.sh
```

### 3. 启动服务

```bash
# 启动自举系统
./scripts/start-bootstrap.sh

# 或手动启动
cd backend
go run cmd/bootstrap/main.go --config="../configs/bootstrap-config.yml"
```

### 4. 验证运行

```bash
# 健康检查
curl http://localhost:8081/health

# 系统状态
curl http://localhost:8081/api/v1/bootstrap/status \
  -H "Authorization: Bearer your_token"
```

## 📖 使用指南

### GitHub Issue 自动处理

1. **创建Issue**: 使用提供的模板创建Issue
2. **添加标签**: 添加 `auto-modify` 标签启用自动处理
3. **等待处理**: 系统自动分析需求并生成代码
4. **审核PR**: 查看自动生成的Pull Request
5. **合并部署**: 审核通过后合并代码

#### Issue 模板示例

```markdown
---
title: '[feat] 添加用户头像上传功能'
labels: ['enhancement', 'auto-modify']
---

## 🎯 功能描述
为用户资料页面添加头像上传功能

## 🔧 技术要求
- [ ] 前端：React组件开发
- [ ] 后端：文件上传API
- [ ] 存储：MinIO集成

## 📋 验收标准
- [ ] 支持JPEG、PNG格式
- [ ] 文件大小限制2MB
- [ ] 头像预览功能

## 🧪 测试要求
- [ ] 单元测试
- [ ] 集成测试

### 🔄 自动修改设置
- [x] 启用自动处理
- 复杂度：Medium
- 安全级别：Safe
```

### API 使用示例

#### 解析Go代码
```bash
curl -X POST http://localhost:8081/api/v1/bootstrap/parse/go \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{"file_path": "internal/api/handler/user.go"}'
```

#### 应用代码修改
```bash
curl -X POST http://localhost:8081/api/v1/bootstrap/modify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "id": "mod-001",
    "type": "modify",
    "target_files": ["internal/api/handler/user.go"],
    "changes": [{
      "file": "internal/api/handler/user.go",
      "start_line": 20,
      "end_line": 25,
      "old_code": "// old function",
      "new_code": "// new function",
      "change_type": "function"
    }],
    "metadata": {
      "requester": "admin",
      "reason": "Add avatar upload feature"
    },
    "options": {
      "create_backup": true,
      "run_tests": true,
      "auto_format": true
    }
  }'
```

#### 创建备份
```bash
curl -X POST http://localhost:8081/api/v1/bootstrap/backup/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d '{
    "description": "Before adding avatar feature",
    "files": ["internal/api/handler/user.go", "frontend/src/pages/Profile.tsx"],
    "reason": "Feature development backup"
  }'
```

#### 紧急回滚
```bash
curl -X POST http://localhost:8081/api/v1/bootstrap/emergency/rollback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your_token" \
  -d 'reason=System+malfunction+detected'
```

## ⚙️ 配置说明

### 主配置文件 (bootstrap-config.yml)

```yaml
bootstrap:
  enabled: true
  safety_mode: strict  # strict/moderate/permissive

  core_protection:
    protected_paths:
      - "internal/bootstrap"
      - "internal/auth"
    allowed_users:
      - "admin"
      - "system"

  sandbox:
    docker_image: "codeevolve/sandbox:latest"
    memory_limit: "500MB"
    timeout_seconds: 300

  github_integration:
    auto_labels: ["auto-modify", "bootstrap-generated"]
    pr_auto_merge:
      max_files_changed: 3
      no_core_modules: true
```

### 分层保护配置 (layer-protection.yml)

```yaml
layers:
  core:
    protection_level: "MAXIMUM"
    paths: ["internal/bootstrap/**"]
    require_admin_approval: true

  extension:
    protection_level: "MEDIUM"
    paths: ["internal/api/handler/**"]
    auto_merge_conditions:
      all_tests_pass: true
```

## 🔒 安全机制

### 多层防护体系

1. **访问控制**: 基于角色的权限管理
2. **代码分层**: 核心/保护/扩展层级保护
3. **恶意检测**: 多模式恶意代码检测
4. **沙箱隔离**: Docker容器完全隔离
5. **审计日志**: 完整的操作记录
6. **自动回滚**: 检测到问题自动恢复

### 风险等级

- **🔴 HIGH**: 核心模块修改，需要管理员审批
- **🟡 MEDIUM**: 保护文件修改，需要详细说明
- **🟢 LOW**: 扩展模块修改，可以自动处理

## 📊 监控与运维

### 系统监控

```bash
# 查看系统状态
curl http://localhost:8081/api/v1/bootstrap/status

# 查看备份列表
curl http://localhost:8081/api/v1/bootstrap/backup/list

# 查看修改历史
tail -f logs/bootstrap-audit.log
```

### 日志位置

- **主日志**: `logs/bootstrap.log`
- **审计日志**: `logs/bootstrap-audit.log`
- **错误日志**: `logs/bootstrap-error.log`
- **沙箱日志**: `logs/sandbox.log`

### 性能优化

- **缓存策略**: AST解析结果缓存
- **并发控制**: 限制同时执行的修改数量
- **资源限制**: 沙箱环境资源配额
- **清理机制**: 自动清理旧备份和日志

## 🚨 故障排除

### 常见问题

1. **Docker容器启动失败**
   ```bash
   # 检查Docker状态
   docker ps
   # 重建沙箱镜像
   docker build -t codeevolve/sandbox:latest backend/internal/bootstrap/sandbox/
   ```

2. **Go模块依赖问题**
   ```bash
   cd backend
   go mod tidy
   go mod download
   ```

3. **权限不足错误**
   ```bash
   # 检查用户权限配置
   cat configs/bootstrap-config.yml | grep -A5 allowed_users
   ```

4. **GitHub集成失败**
   ```bash
   # 检查环境变量
   echo $GITHUB_TOKEN
   # 测试GitHub API
   curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
   ```

### 紧急操作

```bash
# 紧急停止系统
pkill -f bootstrap

# 紧急回滚
curl -X POST http://localhost:8081/api/v1/bootstrap/emergency/rollback \
  -d "reason=Emergency+stop"

# 锁定核心模块
touch .bootstrap-lock
```

## 🛣️ 发展路线

### 阶段1: 基础功能 (已完成)
- ✅ AST解析器
- ✅ 代码分层保护
- ✅ 沙箱执行环境
- ✅ 备份回滚机制

### 阶段2: GitHub集成 (进行中)
- ✅ Issue解析
- ✅ PR自动生成
- 🔄 Webhook集成
- 🔄 状态同步

### 阶段3: AI增强 (计划中)
- 🔄 需求理解优化
- 🔄 代码生成质量提升
- 🔄 智能冲突解决
- 🔄 自动测试生成

### 阶段4: 高级功能 (未来)
- 📋 多语言支持扩展
- 📋 分布式部署
- 📋 实时协作
- 📋 智能推荐系统

## 🤝 贡献指南

### 开发环境设置

1. Fork 仓库
2. 克隆到本地
3. 安装依赖
4. 运行测试
5. 提交PR

### 代码规范

- Go代码使用 `gofmt` 格式化
- TypeScript代码使用 `prettier` 格式化
- 提交信息遵循 Conventional Commits
- 所有功能需要对应测试

### 安全要求

- 不得修改核心保护模块
- 新功能需要安全评估
- 敏感信息不得硬编码
- 所有输入需要验证

## 📄 许可证

本项目基于 MIT 许可证开源。

## 🆘 支持与反馈

- 📧 Email: admin@codeevolve.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/CodeEvolve/issues)
- 📖 文档: [项目文档](./docs/)
- 💬 讨论: [GitHub Discussions](https://github.com/your-org/CodeEvolve/discussions)

---

⭐ 如果这个项目对您有帮助，请给个Star支持一下！

**🤖 Powered by CodeEvolve AI**