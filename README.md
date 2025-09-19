# CodeEvolve - 智能代码生成平台

基于四层架构的智能代码生成平台，支持模板管理、AI定制和自动化部署。

## 🚀 项目特点

- **🎯 四层解耦架构**: 前端、后端、AI、工具链各司其职，松耦合设计
- **🤖 AI智能定制**: 支持自然语言描述需求，AI自动生成定制代码
- **📦 丰富模板库**: 内置React、Vue、Golang、Java等多技术栈模板
- **🔧 可视化配置**: 通过表单配置即可生成个性化项目代码
- **⚡ 实时预览**: 在线预览生成效果，支持代码编辑和调试
- **🛠 一站式工具链**: 集成测试、构建、部署全流程自动化

## 架构概览

```
┌─────────────────────────┐  HTTP/WS  ┌─────────────────────────┐  gRPC/HTTP  ┌─────────────────────────┐
│        前端层           │◄─────────►│        后端层           │◄─────────►│       AI能力层          │
│  React + Ant Design Pro │           │        Golang (Gin)     │           │      FastAPI (Python)   │
└─────────────────────────┘           └─────────────────────────┘           └─────────────────────────┘
                                              ▲
                                              │  API调用
                                              ▼
┌─────────────────────────┐           ┌─────────────────────────┐
│       工具链层          │◄─────────►│        数据存储层        │
│  测试/CI/CD/代码托管    │           │  MySQL + MinIO + Redis  │
└─────────────────────────┘           └─────────────────────────┘
```

## 目录结构

```
CodeEvolve/
├── frontend/              # 前端层 (React + Ant Design Pro)
│   ├── src/pages/         # 页面组件 (模板管理、代码生成、AI定制等)
│   ├── src/services/      # API请求封装
│   └── .umirc.ts         # 配置文件
├── backend/               # 后端层 (Golang + Gin)
│   ├── cmd/api/           # 服务入口
│   ├── internal/          # 内部业务逻辑
│   │   ├── model/         # 数据模型
│   │   ├── service/       # 业务服务
│   │   ├── repo/          # 数据访问
│   │   └── api/           # API处理器
│   └── configs/           # 配置文件
├── ai-service/            # AI能力层 (Python + FastAPI)
│   ├── api/endpoints/     # API端点
│   ├── core/              # 核心逻辑 (需求解析、代码生成、质量检查)
│   └── models/            # 数据模型
├── toolchain/             # 工具链层 (测试/CI/CD)
├── docs/                  # 文档
├── docker-compose.yml     # 本地开发环境
└── QUICKSTART.md         # 快速启动指南
```

## 🏁 快速开始

详细启动指南请查看 [QUICKSTART.md](./QUICKSTART.md)

### 一键启动开发环境

```bash
# 1. 启动基础服务
docker-compose up -d mysql redis minio

# 2. 启动后端 (新终端)
cd backend && go run cmd/api/main.go

# 3. 启动AI服务 (新终端)
cd ai-service && pip install -r requirements.txt && python main.py

# 4. 启动前端 (新终端)
cd frontend && npm install && npm start
```

### 访问地址

- 🖥 **前端应用**: http://localhost:3000
- 🔧 **后端API**: http://localhost:8080
- 🤖 **AI服务**: http://localhost:8000
- 📖 **API文档**: http://localhost:8080/swagger/index.html
- 🗃 **MinIO控制台**: http://localhost:9001

## 核心功能

### 🎨 模板管理
- 支持React、Vue、Angular前端模板
- 支持Golang、Java、Python后端模板
- 可视化模板编辑和配置
- 模板版本管理和分享

### ⚙️ 代码生成
- 基于模板快速生成项目脚手架
- 支持自定义参数配置
- 增量生成，避免覆盖用户修改
- 多格式输出(ZIP、Git仓库)

### 🧠 AI智能定制
- 自然语言描述功能需求
- AI自动解析并生成实现代码
- 支持功能添加、性能优化、Bug修复
- 代码质量检查和建议

### 🔍 预览与测试
- 在线代码预览和编辑
- 自动化单元测试和E2E测试
- 实时构建状态展示
- 多环境部署支持

## 🛠 技术栈



### 后端层
- **语言**: Golang 1.21
- **框架**: Gin (HTTP路由) + GORM (ORM)
- **数据库**: MySQL 8.0 + Redis 6.0
- **存储**: MinIO (对象存储)
- **认证**: JWT + 中间件


## 📚 使用示例

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关链接

- [项目文档](./docs/)
- [API文档](http://localhost:8080/swagger/index.html)
- [AI服务文档](http://localhost:8000/docs)
- [问题反馈](https://github.com/your-org/CodeEvolve/issues)

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！