# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CodeEvolve is an AI-driven intelligent code generation platform with a unique **self-bootstrapping system** that can understand, analyze, and safely modify its own codebase. The project consists of a four-layer architecture with an additional bootstrap layer for self-evolution capabilities.

### Core Architecture

```
┌─────────────────────────┐  HTTP/WS  ┌─────────────────────────┐  gRPC/HTTP  ┌─────────────────────────┐
│        Frontend         │◄─────────►│        Backend          │◄─────────►│       AI Layer          │
│  React + Ant Design Pro │           │        Golang (Gin)     │           │      FastAPI (Python)   │
└─────────────────────────┘           └─────────────────────────┘           └─────────────────────────┘
                                              ▲
                                              │  API调用
                                              ▼
┌─────────────────────────┐           ┌─────────────────────────┐
│       Toolchain         │◄─────────►│        Storage          │
│  Testing/CI/CD/SCM      │           │  MySQL + MinIO + Redis  │
└─────────────────────────┘           └─────────────────────────┘
                                              ▲
                                              │
                                              ▼
                                    ┌─────────────────────────┐
                                    │   Bootstrap System      │
                                    │  Self-Evolution Layer   │
                                    └─────────────────────────┘
```

### Bootstrap System Architecture

The self-bootstrapping system consists of six interconnected layers:

- **Self-Aware Layer**: AST parsing for Go/TypeScript, metadata extraction, dependency analysis
- **Modification Engine**: Code generation, conflict resolution, safety checking
- **Verification Layer**: Unit/integration/E2E testing, security scanning
- **GitHub Integration**: Issue parsing, PR auto-generation, workflow automation
- **Sandbox Layer**: Docker isolation, resource limiting, safe execution
- **Core Protection**: Multi-level security, access control, audit logging

## Development Commands

### Main Application (Traditional Stack)

```bash
# Start infrastructure services
docker-compose up -d mysql redis minio

# Backend (port 8080)
cd backend
go mod tidy
go run cmd/api/main.go

# AI Service (port 8000)
cd ai-service
pip install -r requirements.txt
python main.py

# Frontend (port 3000)
cd frontend
npm install
npm start
```

### Bootstrap System (Self-Evolution)

```bash
# Test bootstrap system
./scripts/test-bootstrap.sh

# Start bootstrap system (port 8081)
./scripts/start-bootstrap.sh

# Manual bootstrap start
cd backend
go run cmd/bootstrap/main.go --config="../configs/bootstrap-config.yml"

# Bootstrap system health check
curl http://localhost:8081/health

# Emergency rollback
curl -X POST http://localhost:8081/api/v1/bootstrap/emergency/rollback \
  -H "Authorization: Bearer your_token" \
  -d "reason=Emergency+rollback"
```

### Testing

```bash
# Run all tests
go test ./...                    # Backend tests
npm test                         # Frontend tests (in frontend/)
python -m pytest               # AI service tests (in ai-service/)

# Specific testing
go test ./internal/bootstrap/... # Bootstrap system tests
npm run test:coverage           # Frontend with coverage
pytest --cov=bootstrap          # AI service with coverage

# Integration testing
./scripts/test-bootstrap.sh     # Full bootstrap system validation
```

### Build and Deployment

```bash
# Build applications
go build -o backend cmd/api/main.go        # Main backend
go build -o bootstrap cmd/bootstrap/main.go # Bootstrap system
npm run build                               # Frontend (in frontend/)

# Build Docker images
docker build -t codeevolve/backend .
docker build -t codeevolve/frontend frontend/
docker build -t codeevolve/sandbox backend/internal/bootstrap/sandbox/

# Deploy with Docker Compose
docker-compose up -d
```

## Key Configuration Files

### Bootstrap System Configuration
- `configs/bootstrap-config.yml`: Main bootstrap configuration
- `configs/layer-protection.yml`: Code layer protection rules
- `configs/github-templates/`: Issue and PR templates

### Application Configuration
- `frontend/.umirc.ts`: Frontend routing and proxy configuration
- `docker-compose.yml`: Infrastructure services
- `backend/configs/`: Backend service configurations

## Bootstrap System Security Model

### Code Layer Protection
1. **Core Layer** (`internal/bootstrap`, `internal/auth`): Requires admin approval
2. **Protected Layer** (`go.mod`, `package.json`, configs): Requires justification
3. **Extension Layer** (`internal/api/handler`, `frontend/src/pages`): Auto-modifiable
4. **Config Layer**: Special validation and restart procedures

### Safety Mechanisms
- AST-level code analysis and modification
- Docker sandbox isolation for all code execution
- Automatic backup before any modification
- Multi-pattern malicious code detection
- Role-based access control (admin/developer/viewer)
- Complete audit logging of all operations

## GitHub Integration Workflow

### Issue Processing
1. Create GitHub Issue with `auto-modify` label
2. System parses requirements and analyzes scope
3. Safety validation and layer protection checks
4. Code generation in isolated sandbox environment
5. Automated testing and quality verification
6. PR creation with detailed change documentation
7. Optional human review based on complexity/risk
8. Automatic merge for low-risk changes

### Issue Templates
Use provided templates in `configs/github-templates/ISSUE_TEMPLATE/`:
- `feature_request.md`: For new features
- `bug_report.md`: For bug fixes
- `optimization.md`: For performance improvements

## Environment Variables

Required for full functionality:
```bash
export OPENAI_API_KEY="your_openai_key"     # For AI-powered code generation
export GITHUB_TOKEN="your_github_token"     # For GitHub integration
```

Optional:
```bash
export JWT_SECRET="your_jwt_secret"          # For authentication
export MYSQL_PASSWORD="your_db_password"    # For database access
```

## Development Workflow

### Working with Bootstrap System
1. **Never modify core bootstrap modules** without admin approval
2. **Use the layer protection system** - check file classification with:
   ```bash
   curl http://localhost:8081/api/v1/bootstrap/layers/path/to/file
   ```
3. **Test modifications in sandbox** before applying to main codebase
4. **Create backups** before significant changes:
   ```bash
   curl -X POST http://localhost:8081/api/v1/bootstrap/backup/create \
     -d '{"description":"Pre-change backup","files":["file1","file2"]}'
   ```

### Code Style and Standards
- Go: Use `gofmt` for formatting, follow standard Go conventions
- TypeScript: Use Prettier for formatting, follow React/Ant Design patterns
- Python: Use Black and isort for formatting
- Commit messages: Follow Conventional Commits format

## API Endpoints

### Main Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api/v1/
- AI Service: http://localhost:8000
- API Documentation: http://localhost:8080/swagger/index.html

### Bootstrap System
- Bootstrap API: http://localhost:8081/api/v1/bootstrap/
- Health Check: http://localhost:8081/health
- System Status: http://localhost:8081/api/v1/bootstrap/status

### MinIO (Object Storage)
- Console: http://localhost:9001 (minioadmin/minioadmin123)
- API: http://localhost:9000

## Emergency Procedures

### System Recovery
```bash
# Stop all services
docker-compose down
pkill -f "go run"
pkill -f "npm start"
pkill -f "python main.py"

# Emergency bootstrap rollback
curl -X POST http://localhost:8081/api/v1/bootstrap/emergency/rollback

# Lock bootstrap system
touch .bootstrap-lock
```

### Troubleshooting
- Check logs in `logs/` directory
- Verify Docker daemon is running for sandbox operations
- Ensure all required ports (3000, 8000, 8080, 8081) are available
- Validate environment variables are set correctly

## Important Notes

- The bootstrap system can modify its own code safely through the protection layers
- All modifications go through sandbox testing before being applied
- Emergency rollback is always available to restore to last known good state
- Core system components are protected and require explicit admin approval
- GitHub integration enables autonomous issue processing and PR generation