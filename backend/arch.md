# 架构文档

## 项目概述
本项目是一个基于 Go 语言的后端服务，使用 Gin 框架和 Swagger 文档工具，提供 API 接口服务。

## 技术栈
- **编程语言**: Go 1.24.0
- **框架**: Gin
- **数据库**: MySQL
- **缓存**: Redis
- **对象存储**: MinIO
- **文档工具**: Swagger

## 依赖项
- Gin
- Redis
- MinIO
- JWT
- Swagger

## 配置信息
- **服务器**: 端口 `8080`，运行模式 `debug`
- **数据库**: 连接信息见 `configs/config.yaml`
- **Redis**: 连接信息见 `configs/config.yaml`

## 模块结构
- `main.go`: 主程序入口
- `internal`:
  - `api`: API 处理逻辑
  - `middleware`: 中间件
  - `model`: 数据模型
  - `repo`: 存储库
  - `service`: 服务层
- `configs`: 配置文件

## 核心功能
1. API 接口服务
2. 数据库操作
3. 缓存管理
4. 对象存储

## 后续优化建议
1. 增加单元测试覆盖率
2. 优化数据库查询性能
3. 引入 CI/CD 流程