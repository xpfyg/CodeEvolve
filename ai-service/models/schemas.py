"""
数据模型和模式定义
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from enum import Enum

class TaskStatus(str, Enum):
    """任务状态"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class RequirementType(str, Enum):
    """需求类型"""
    FEATURE_ADDITION = "feature_addition"
    OPTIMIZATION = "optimization"
    BUG_FIX = "bug_fix"
    REFACTORING = "refactoring"
    GENERAL = "general"

class Complexity(str, Enum):
    """复杂度级别"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class InstructionType(str, Enum):
    """指令类型"""
    FRONTEND = "frontend"
    BACKEND = "backend"
    DATABASE = "database"
    GENERAL = "general"

# ===== 需求解析相关模型 =====

class TechnicalInstruction(BaseModel):
    """技术指令"""
    type: InstructionType = Field(..., description="指令类型")
    action: str = Field(..., description="具体操作描述")
    target: str = Field(..., description="操作目标")
    priority: str = Field(default="medium", description="优先级")
    estimated_time: str = Field(..., description="预估时间")
    dependencies: List[str] = Field(default_factory=list, description="依赖项")
    code_snippets: Optional[List[str]] = Field(default=None, description="相关代码片段")

class RequirementAnalysis(BaseModel):
    """需求分析结果"""
    requirement_type: RequirementType = Field(..., description="需求类型")
    tech_stack: List[str] = Field(default_factory=list, description="识别的技术栈")
    complexity: Complexity = Field(..., description="复杂度评估")
    word_count: int = Field(..., description="字数统计")
    has_technical_terms: bool = Field(..., description="是否包含技术术语")
    timestamp: datetime = Field(default_factory=datetime.now, description="分析时间")

class ValidationResult(BaseModel):
    """需求验证结果"""
    is_valid: bool = Field(..., description="是否有效")
    issues: List[str] = Field(default_factory=list, description="问题列表")
    suggestions: List[str] = Field(default_factory=list, description="改进建议")
    clarity_score: float = Field(..., description="清晰度评分", ge=0.0, le=1.0)

class RequirementRequest(BaseModel):
    """需求解析请求"""
    requirement: str = Field(..., description="用户需求描述")
    context: Optional[Dict[str, Any]] = Field(None, description="上下文信息")
    language: str = Field(default="zh", description="语言")

class RequirementResponse(BaseModel):
    """需求解析响应"""
    task_id: str = Field(..., description="任务ID")
    instructions: List[TechnicalInstruction] = Field(..., description="技术指令")
    confidence: float = Field(..., description="置信度", ge=0.0, le=1.0)
    suggestions: List[str] = Field(default_factory=list, description="建议")
    analysis: RequirementAnalysis = Field(..., description="分析结果")

# ===== 代码生成相关模型 =====

class CodeContext(BaseModel):
    """代码上下文"""
    language: str = Field(..., description="编程语言")
    framework: Optional[str] = Field(None, description="框架")
    existing_code: Optional[str] = Field(None, description="现有代码")
    file_path: Optional[str] = Field(None, description="文件路径")
    project_structure: Optional[Dict[str, Any]] = Field(None, description="项目结构")

class CodeGenerationRequest(BaseModel):
    """代码生成请求"""
    instructions: List[TechnicalInstruction] = Field(..., description="技术指令")
    context: CodeContext = Field(..., description="代码上下文")
    preferences: Optional[Dict[str, Any]] = Field(None, description="用户偏好")

class GeneratedCode(BaseModel):
    """生成的代码"""
    file_path: str = Field(..., description="文件路径")
    content: str = Field(..., description="代码内容")
    language: str = Field(..., description="编程语言")
    description: str = Field(..., description="代码说明")
    changes: Optional[List[str]] = Field(None, description="变更说明")

class CodeGenerationResponse(BaseModel):
    """代码生成响应"""
    task_id: str = Field(..., description="任务ID")
    status: TaskStatus = Field(..., description="任务状态")
    generated_files: List[GeneratedCode] = Field(default_factory=list, description="生成的文件")
    summary: str = Field(..., description="生成摘要")
    warnings: List[str] = Field(default_factory=list, description="警告信息")

# ===== 代码定制相关模型 =====

class CustomizationRequest(BaseModel):
    """代码定制请求"""
    original_code: str = Field(..., description="原始代码")
    requirement: str = Field(..., description="定制需求")
    context: CodeContext = Field(..., description="代码上下文")
    options: Optional[Dict[str, Any]] = Field(None, description="定制选项")

class CodeDiff(BaseModel):
    """代码差异"""
    file_path: str = Field(..., description="文件路径")
    original_lines: List[str] = Field(..., description="原始代码行")
    modified_lines: List[str] = Field(..., description="修改后代码行")
    change_type: str = Field(..., description="变更类型（add/delete/modify）")
    line_numbers: Dict[str, int] = Field(..., description="行号信息")

class CustomizationResponse(BaseModel):
    """代码定制响应"""
    task_id: str = Field(..., description="任务ID")
    status: TaskStatus = Field(..., description="任务状态")
    customized_code: str = Field(..., description="定制后代码")
    changes: List[CodeDiff] = Field(default_factory=list, description="代码差异")
    explanation: str = Field(..., description="修改说明")
    confidence: float = Field(..., description="置信度", ge=0.0, le=1.0)

# ===== 质量检查相关模型 =====

class QualityIssue(BaseModel):
    """质量问题"""
    type: str = Field(..., description="问题类型")
    severity: str = Field(..., description="严重程度（high/medium/low）")
    message: str = Field(..., description="问题描述")
    file_path: str = Field(..., description="文件路径")
    line_number: Optional[int] = Field(None, description="行号")
    suggestion: Optional[str] = Field(None, description="修复建议")

class QualityMetrics(BaseModel):
    """质量指标"""
    code_coverage: Optional[float] = Field(None, description="代码覆盖率")
    complexity_score: float = Field(..., description="复杂度评分")
    maintainability: float = Field(..., description="可维护性评分")
    performance_score: float = Field(..., description="性能评分")
    security_score: float = Field(..., description="安全评分")

class QualityCheckRequest(BaseModel):
    """质量检查请求"""
    code: str = Field(..., description="待检查代码")
    language: str = Field(..., description="编程语言")
    check_types: List[str] = Field(default=["syntax", "style", "security"], description="检查类型")
    context: Optional[CodeContext] = Field(None, description="代码上下文")

class QualityCheckResponse(BaseModel):
    """质量检查响应"""
    task_id: str = Field(..., description="任务ID")
    status: TaskStatus = Field(..., description="检查状态")
    overall_score: float = Field(..., description="总体评分", ge=0.0, le=100.0)
    issues: List[QualityIssue] = Field(default_factory=list, description="发现的问题")
    metrics: QualityMetrics = Field(..., description="质量指标")
    suggestions: List[str] = Field(default_factory=list, description="改进建议")

# ===== 通用响应模型 =====

class ErrorResponse(BaseModel):
    """错误响应"""
    error: str = Field(..., description="错误类型")
    message: str = Field(..., description="错误消息")
    detail: Optional[str] = Field(None, description="详细信息")
    timestamp: datetime = Field(default_factory=datetime.now, description="错误时间")

class TaskResponse(BaseModel):
    """通用任务响应"""
    task_id: str = Field(..., description="任务ID")
    status: TaskStatus = Field(..., description="任务状态")
    progress: int = Field(default=0, description="进度百分比", ge=0, le=100)
    message: str = Field(..., description="状态消息")
    result: Optional[Dict[str, Any]] = Field(None, description="结果数据")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")
    updated_at: datetime = Field(default_factory=datetime.now, description="更新时间")

class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str = Field(..., description="服务状态")
    message: str = Field(..., description="状态描述")
    version: str = Field(..., description="服务版本")
    timestamp: datetime = Field(default_factory=datetime.now, description="检查时间")
    dependencies: Optional[Dict[str, str]] = Field(None, description="依赖服务状态")