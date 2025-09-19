# AI 代码生成服务

这是一个基于 Python + FastAPI + GitPython 的 AI 驱动代码修改服务，支持自动创建分支、生成代码、提交并推送到 GitHub。

## 功能特性

- 🤖 **AI 代码生成**: 支持 Claude 和 OpenAI GPT 模型
- 🔄 **Git 自动化**: 自动创建分支、提交和推送
- 📊 **代码分析**: AI 驱动的代码质量分析
- 🧪 **测试生成**: 自动生成单元测试
- 🌐 **RESTful API**: 完整的 FastAPI 接口

## 快速开始

### 1. 安装依赖

```bash
cd ai-service
pip install -r requirements.txt
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 API 密钥
```

### 3. 启动服务

```bash
python main.py
```

服务将在 http://localhost:8000 启动

## API 文档

### 生成代码

```bash
POST /generate-code
```

**请求体示例:**

```json
{
    "requirement": "创建一个用户登录功能",
    "repo_path": "/path/to/your/repo",
    "target_files": ["src/auth.py"],
    "branch_name": "feature/user-login"
}
```

**响应示例:**

```json
{
    "success": true,
    "branch_name": "feature/user-login",
    "commit_hash": "abc123...",
    "message": "成功生成代码并推送到分支 feature/user-login",
    "modified_files": ["src/auth.py"]
}
```

### 代码分析

```bash
POST /api/v1/analyze-code
```

**请求体示例:**

```json
{
    "repo_path": "/path/to/your/repo",
    "file_path": "src/main.py"
}
```

### 生成测试

```bash
POST /api/v1/generate-tests
```

**请求体示例:**

```json
{
    "repo_path": "/path/to/your/repo",
    "file_path": "src/auth.py",
    "test_file_path": "tests/test_auth.py"
}
```

### 仓库信息

```bash
# 获取分支列表
GET /repos/{repo_path}/branches

# 获取文件列表
GET /repos/{repo_path}/files?extension=.py
```

## 使用示例

### Python 客户端示例

```python
import requests

# 生成代码
response = requests.post('http://localhost:8000/generate-code', json={
    'requirement': '添加用户认证中间件',
    'repo_path': '/Users/username/my-project',
    'target_files': ['middleware/auth.py']
})

print(response.json())
```

### curl 示例

```bash
curl -X POST "http://localhost:8000/generate-code" \
     -H "Content-Type: application/json" \
     -d '{
       "requirement": "创建一个REST API端点",
       "repo_path": "/path/to/repo",
       "branch_name": "feature/new-api"
     }'
```

## 工作流程

1. **输入需求** - 用户描述要实现的功能
2. **创建分支** - 在本地仓库创建新分支
3. **AI 生成** - 调用 AI 分析需求并生成代码
4. **文件修改** - 将 AI 生成的代码写入文件
5. **自动提交** - 提交更改并推送到 GitHub

## 配置说明

### 支持的 AI 模型

- **Claude (Anthropic)**: claude-3-sonnet-20240229
- **OpenAI**: gpt-4, gpt-3.5-turbo

### 环境变量

| 变量名 | 描述 | 必需 |
|--------|------|------|
| `OPENAI_API_KEY` | OpenAI API 密钥 | 可选* |
| `ANTHROPIC_API_KEY` | Anthropic API 密钥 | 可选* |
| `PORT` | 服务端口 | 否 (默认 8000) |
| `GITHUB_TOKEN` | GitHub 令牌 | 否 |

*至少需要配置一个 AI API 密钥

## 安全注意事项

- 🔒 不要将 API 密钥提交到版本控制
- 🛡️ 建议在生产环境中设置 API 访问限制
- 🔍 定期审查 AI 生成的代码
- 📋 在应用代码修改前进行测试

## 故障排除

### 常见问题

1. **Git 权限错误**
   - 确保对目标仓库有推送权限
   - 检查 SSH 密钥或 HTTPS 认证

2. **AI API 调用失败**
   - 验证 API 密钥是否正确
   - 检查网络连接和 API 配额

3. **文件路径错误**
   - 确保仓库路径存在且有效
   - 检查目标文件的权限

### 日志查看

```bash
# 启动时查看详细日志
LOG_LEVEL=DEBUG python main.py
```

## 开发

### 项目结构

```
ai-service/
├── main.py              # FastAPI 应用入口
├── git_service.py       # Git 操作服务
├── ai_service.py        # AI 代码生成服务
├── api_routes.py        # API 路由定义
├── requirements.txt     # Python 依赖
├── .env.example        # 环境变量示例
└── README.md           # 项目文档
```

### 扩展功能

- 添加更多 AI 模型支持
- 集成代码格式化工具
- 支持更多编程语言
- 添加 WebSocket 实时通信
- 集成 CI/CD 流水线

## 许可证

MIT License