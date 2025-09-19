"""
代码生成API
基于技术指令自动生成代码
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
import logging

from core.codegen import CodeGenerator
from models.schemas import (
    CodeGenerationRequest, CodeGenerationResponse,
    GeneratedCode, TaskStatus
)

router = APIRouter()
logger = logging.getLogger(__name__)

# 全局代码生成器实例
generator = CodeGenerator()

@router.post("/generate", response_model=CodeGenerationResponse)
async def generate_code(request: CodeGenerationRequest):
    """
    根据技术指令生成代码

    接收技术指令列表和上下文信息，生成相应的代码文件。
    支持多种编程语言和框架。
    """
    try:
        task_id = str(uuid.uuid4())
        logger.info(f"Generating code for task: {task_id}")

        # 调用代码生成器
        result = await generator.generate_code(
            instructions=request.instructions,
            context=request.context,
            preferences=request.preferences
        )

        return CodeGenerationResponse(
            task_id=task_id,
            status=TaskStatus.COMPLETED,
            generated_files=result.generated_files,
            summary=result.summary,
            warnings=result.warnings
        )

    except Exception as e:
        logger.error(f"Failed to generate code: {e}")
        raise HTTPException(status_code=500, detail=f"代码生成失败: {str(e)}")

@router.post("/customize")
async def customize_code(request: dict):
    """
    定制现有代码

    根据用户需求对现有代码进行修改和优化。
    """
    try:
        task_id = str(uuid.uuid4())
        logger.info(f"Customizing code for task: {task_id}")

        # 调用代码定制器
        result = await generator.customize_code(
            original_code=request.get("original_code"),
            requirement=request.get("requirement"),
            context=request.get("context", {}),
            options=request.get("options", {})
        )

        return {
            "task_id": task_id,
            "status": "completed",
            "customized_code": result.customized_code,
            "changes": result.changes,
            "explanation": result.explanation,
            "confidence": result.confidence
        }

    except Exception as e:
        logger.error(f"Failed to customize code: {e}")
        raise HTTPException(status_code=500, detail=f"代码定制失败: {str(e)}")

@router.get("/templates")
async def get_code_templates():
    """
    获取代码模板

    返回各种常用的代码模板，用户可以基于模板快速生成代码。
    """
    templates = {
        "react": {
            "component": "React函数组件模板",
            "hook": "自定义Hook模板",
            "context": "Context Provider模板"
        },
        "fastapi": {
            "router": "API路由模板",
            "model": "Pydantic模型模板",
            "middleware": "中间件模板"
        },
        "golang": {
            "handler": "HTTP处理器模板",
            "struct": "结构体模板",
            "interface": "接口模板"
        },
        "database": {
            "migration": "数据库迁移模板",
            "model": "ORM模型模板",
            "query": "查询模板"
        }
    }

    return templates

@router.get("/languages")
async def get_supported_languages():
    """
    获取支持的编程语言

    返回系统支持的编程语言和框架列表。
    """
    languages = {
        "frontend": ["JavaScript", "TypeScript", "React", "Vue", "Angular"],
        "backend": ["Python", "Go", "Java", "Node.js"],
        "database": ["SQL", "MongoDB Query"],
        "mobile": ["React Native", "Flutter"],
        "desktop": ["Electron", "Tauri"]
    }

    return languages