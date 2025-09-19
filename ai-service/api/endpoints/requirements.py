"""
需求解析API
处理自然语言需求，转换为技术指令
"""
# -*- coding: utf-8 -*-

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
import logging

from core.parser import RequirementParser
from models.schemas import RequirementRequest, RequirementResponse, TechnicalInstruction

router = APIRouter()
logger = logging.getLogger(__name__)

# 全局解析器实例
parser = RequirementParser()

class ParseRequest(BaseModel):
    """需求解析请求"""
    requirement: str = Field(..., description="用户需求描述", min_length=1, max_length=2000)
    context: Optional[Dict[str, Any]] = Field(None, description="上下文信息（如项目技术栈、现有代码等）")
    language: str = Field("zh", description="需求语言", pattern="^(zh|en)$")

class ParseResponse(BaseModel):
    """需求解析响应"""
    task_id: str = Field(..., description="任务ID")
    instructions: List[TechnicalInstruction] = Field(..., description="技术指令列表")
    confidence: float = Field(..., description="解析置信度", ge=0.0, le=1.0)
    suggestions: List[str] = Field(default_factory=list, description="优化建议")

@router.post("/parse", response_model=ParseResponse)
async def parse_requirement(request: ParseRequest):
    """
    解析用户需求为技术指令

    将自然语言描述的需求转换为具体的技术实现指令，
    如"添加分页功能"转换为具体的前后端实现步骤。
    """
    try:
        task_id = str(uuid.uuid4())
        logger.info(f"Parsing requirement: {request.requirement[:100]}...")

        # 调用需求解析器
        result = await parser.parse_requirement(
            requirement=request.requirement,
            context=request.context,
            language=request.language
        )

        return ParseResponse(
            task_id=task_id,
            instructions=result.instructions,
            confidence=result.confidence,
            suggestions=result.suggestions
        )

    except Exception as e:
        logger.error(f"Failed to parse requirement: {e}")
        raise HTTPException(status_code=500, detail=f"解析需求失败: {str(e)}")

@router.post("/validate")
async def validate_requirement(request: ParseRequest):
    """
    验证需求描述的合理性

    检查需求描述是否清晰、可实现，并提供改进建议。
    """
    try:
        logger.info(f"Validating requirement: {request.requirement[:100]}...")

        # 验证需求
        validation_result = await parser.validate_requirement(
            requirement=request.requirement,
            context=request.context
        )

        return {
            "is_valid": validation_result.is_valid,
            "issues": validation_result.issues,
            "suggestions": validation_result.suggestions,
            "clarity_score": validation_result.clarity_score
        }

    except Exception as e:
        logger.error(f"Failed to validate requirement: {e}")
        raise HTTPException(status_code=500, detail=f"验证需求失败: {str(e)}")

@router.get("/examples")
async def get_requirement_examples():
    """
    获取需求描述示例

    返回各种类型的需求描述示例，帮助用户更好地描述需求。
    """
    examples = {
        "frontend": [
            "给用户列表页面添加分页功能，每页显示20条记录",
            "在导航栏添加搜索框，支持按用户名模糊搜索",
            "优化表格加载性能，添加虚拟滚动功能",
            "添加黑夜模式切换功能，记住用户偏好设置"
        ],
        "backend": [
            "为用户接口添加分页查询参数，返回总数和分页数据",
            "实现文件上传功能，支持图片压缩和格式转换",
            "添加接口缓存机制，提升查询性能",
            "实现数据导出功能，支持Excel和CSV格式"
        ],
        "fullstack": [
            "实现用户权限管理系统，包含角色分配和权限控制",
            "添加实时通知功能，支持WebSocket推送",
            "实现数据统计dashboard，包含图表展示",
            "添加多语言支持，中英文切换"
        ],
        "optimization": [
            "优化数据库查询性能，减少N+1查询问题",
            "前端代码分割，按路由懒加载组件",
            "添加错误边界处理，提升用户体验",
            "实现API限流功能，防止恶意请求"
        ]
    }

    return examples

@router.get("/templates")
async def get_requirement_templates():
    """
    获取需求模板

    返回结构化的需求描述模板，用户可以基于模板填写具体需求。
    """
    templates = [
        {
            "name": "功能添加模板",
            "template": "为 {模块/页面} 添加 {功能名称}，要求：{具体要求}，预期效果：{预期效果}",
            "example": "为用户管理页面添加批量操作功能，要求：支持批量删除和批量导出，预期效果：提升管理员操作效率"
        },
        {
            "name": "性能优化模板",
            "template": "优化 {模块/功能} 的 {性能指标}，当前问题：{问题描述}，优化目标：{具体指标}",
            "example": "优化商品列表页的加载速度，当前问题：首屏加载时间过长，优化目标：首屏加载时间控制在2秒内"
        },
        {
            "name": "用户体验模板",
            "template": "改进 {用户场景} 的体验，当前痛点：{痛点描述}，改进方案：{期望方案}",
            "example": "改进表单填写的体验，当前痛点：表单验证提示不够友好，改进方案：实时验证并给出具体的修改建议"
        }
    ]

    return templates