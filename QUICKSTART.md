# CodeEvolve 项目启动指南

## 开发环境准备

### 1. 启动基础服务

```bash
# 启动数据库、Redis和MinIO
docker-compose up -d mysql redis minio
```

### 2. 前端开发

```bash
cd frontend
npm install
npm start
```

前端将在 http://localhost:3000 启动

### 3. 后端开发

```bash
cd backend
go mod tidy
go run cmd/api/main.go
```

后端API将在 http://localhost:8080 启动

### 4. AI服务

```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

AI服务将在 http://localhost:8000 启动

## 访问地址

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8080
- **AI服务**: http://localhost:8000
- **API文档**: http://localhost:8080/swagger/index.html
- **AI API文档**: http://localhost:8000/docs
- **MinIO管理界面**: http://localhost:9001 (minioadmin/minioadmin123)

## 默认账户

- 管理员: admin@codeevolve.com / admin123
- 演示用户: demo@codeevolve.com / demo123

## 开发工具

### API测试
```bash
# 登录获取token
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# 使用token访问受保护API
curl -X GET http://localhost:8080/api/v1/templates \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 数据库操作
```bash
# 连接MySQL
docker exec -it codeevolve-mysql mysql -u codeevolve -p codeevolve

# 查看表结构
SHOW TABLES;
DESCRIBE templates;
```