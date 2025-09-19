"""
CodeEvolve AI Service
AI能力层 - 基于FastAPI的智能代码定制服务
"""

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import os
import logging
from dotenv import load_dotenv

from api.endpoints import requirements, codegen, quality
from core.parser import RequirementParser
from core.codegen import CodeGenerator
from core.quality import QualityChecker

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    logger.info("Starting CodeEvolve AI Service...")

    # 初始化AI模型和服务
    try:
        # 这里可以初始化AI模型、建立数据库连接等
        logger.info("AI Service initialized successfully")
        yield
    except Exception as e:
        logger.error(f"Failed to initialize AI Service: {e}")
        raise
    finally:
        logger.info("Shutting down CodeEvolve AI Service...")

# 创建FastAPI应用
app = FastAPI(
    title="CodeEvolve AI Service",
    description="CodeEvolve智能代码生成平台AI能力层",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 全局异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )

# 健康检查
@app.get("/health")
async def health_check():
    """健康检查接口"""
    return {
        "status": "ok",
        "message": "CodeEvolve AI Service is running",
        "version": "1.0.0"
    }

# 注册路由
app.include_router(requirements.router, prefix="/api/v1/requirements", tags=["需求解析"])
app.include_router(codegen.router, prefix="/api/v1/codegen", tags=["代码生成"])
app.include_router(quality.router, prefix="/api/v1/quality", tags=["质量检查"])

# 根路径
@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "Welcome to CodeEvolve AI Service",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    # 开发环境配置
    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    debug = os.getenv("DEBUG", "true").lower() == "true"

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )