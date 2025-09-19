"""
代码质量检查API
提供代码质量分析和改进建议
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
import logging

from core.quality import QualityChecker
from models.schemas import (
    QualityCheckRequest, QualityCheckResponse,
    QualityIssue, QualityMetrics, TaskStatus
)

router = APIRouter()
logger = logging.getLogger(__name__)

# 全局质量检查器实例
checker = QualityChecker()

@router.post("/check", response_model=QualityCheckResponse)
async def check_code_quality(request: QualityCheckRequest):
    """
    检查代码质量

    对提交的代码进行全面的质量分析，包括语法、风格、
    安全性、性能等方面的检查。
    """
    try:
        task_id = str(uuid.uuid4())
        logger.info(f"Checking code quality for task: {task_id}")

        # 调用质量检查器
        result = await checker.check_quality(
            code=request.code,
            language=request.language,
            check_types=request.check_types,
            context=request.context
        )

        return QualityCheckResponse(
            task_id=task_id,
            status=TaskStatus.COMPLETED,
            overall_score=result.overall_score,
            issues=result.issues,
            metrics=result.metrics,
            suggestions=result.suggestions
        )

    except Exception as e:
        logger.error(f"Failed to check code quality: {e}")
        raise HTTPException(status_code=500, detail=f"代码质量检查失败: {str(e)}")

@router.post("/analyze")
async def analyze_code_complexity(request: dict):
    """
    分析代码复杂度

    计算代码的圈复杂度、认知复杂度等指标，
    帮助识别需要重构的代码片段。
    """
    try:
        task_id = str(uuid.uuid4())
        logger.info(f"Analyzing code complexity for task: {task_id}")

        result = await checker.analyze_complexity(
            code=request.get("code"),
            language=request.get("language"),
            options=request.get("options", {})
        )

        return {
            "task_id": task_id,
            "status": "completed",
            "complexity_metrics": result.complexity_metrics,
            "hotspots": result.hotspots,
            "recommendations": result.recommendations
        }

    except Exception as e:
        logger.error(f"Failed to analyze code complexity: {e}")
        raise HTTPException(status_code=500, detail=f"复杂度分析失败: {str(e)}")

@router.post("/security")
async def security_scan(request: dict):
    """
    安全漏洞扫描

    扫描代码中的安全漏洞，如SQL注入、XSS攻击等，
    并提供修复建议。
    """
    try:
        task_id = str(uuid.uuid4())
        logger.info(f"Running security scan for task: {task_id}")

        result = await checker.security_scan(
            code=request.get("code"),
            language=request.get("language"),
            scan_types=request.get("scan_types", ["all"])
        )

        return {
            "task_id": task_id,
            "status": "completed",
            "security_issues": result.security_issues,
            "severity_counts": result.severity_counts,
            "recommendations": result.recommendations,
            "overall_risk": result.overall_risk
        }

    except Exception as e:
        logger.error(f"Failed to run security scan: {e}")
        raise HTTPException(status_code=500, detail=f"安全扫描失败: {str(e)}")

@router.post("/optimize")
async def optimize_code(request: dict):
    """
    代码优化建议

    分析代码并提供性能优化、可读性改进等建议。
    """
    try:
        task_id = str(uuid.uuid4())
        logger.info(f"Optimizing code for task: {task_id}")

        result = await checker.optimize_code(
            code=request.get("code"),
            language=request.get("language"),
            optimization_types=request.get("optimization_types", ["performance", "readability"])
        )

        return {
            "task_id": task_id,
            "status": "completed",
            "optimizations": result.optimizations,
            "estimated_improvements": result.estimated_improvements,
            "priority_order": result.priority_order
        }

    except Exception as e:
        logger.error(f"Failed to optimize code: {e}")
        raise HTTPException(status_code=500, detail=f"代码优化失败: {str(e)}")

@router.get("/standards")
async def get_coding_standards():
    """
    获取编码标准

    返回各种编程语言的编码标准和最佳实践。
    """
    standards = {
        "python": {
            "style_guide": "PEP 8",
            "naming_conventions": "snake_case for functions/variables, PascalCase for classes",
            "max_line_length": 88,
            "import_order": "standard library, third-party, local imports"
        },
        "javascript": {
            "style_guide": "ESLint recommended",
            "naming_conventions": "camelCase for functions/variables, PascalCase for classes",
            "semicolons": "required",
            "quotes": "single quotes preferred"
        },
        "golang": {
            "style_guide": "Go fmt",
            "naming_conventions": "camelCase for private, PascalCase for public",
            "error_handling": "explicit error handling required",
            "imports": "group standard, third-party, local"
        },
        "java": {
            "style_guide": "Oracle Java Code Conventions",
            "naming_conventions": "camelCase for methods/variables, PascalCase for classes",
            "indentation": "4 spaces",
            "braces": "opening brace on same line"
        }
    }

    return standards

@router.get("/metrics")
async def get_quality_metrics():
    """
    获取质量指标说明

    返回各种代码质量指标的定义和评分标准。
    """
    metrics = {
        "complexity": {
            "description": "代码复杂度指标",
            "cyclomatic_complexity": "圈复杂度，衡量代码分支数量",
            "cognitive_complexity": "认知复杂度，衡量代码理解难度",
            "scoring": "0-10: 简单, 11-20: 中等, 21+: 复杂"
        },
        "maintainability": {
            "description": "可维护性指标",
            "factors": ["代码重复率", "函数长度", "参数数量", "嵌套深度"],
            "scoring": "0-100分，分数越高越好"
        },
        "performance": {
            "description": "性能指标",
            "factors": ["时间复杂度", "空间复杂度", "IO操作", "循环嵌套"],
            "scoring": "基于算法效率和资源使用评分"
        },
        "security": {
            "description": "安全性指标",
            "factors": ["输入验证", "身份认证", "数据加密", "权限控制"],
            "scoring": "基于安全漏洞数量和严重程度评分"
        }
    }

    return metrics