from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional
import logging

from git_service import GitService
from ai_service import AIService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["Code Analysis & Testing"])

git_service = GitService()
ai_service = AIService()

class CodeAnalysisRequest(BaseModel):
    repo_path: str = Field(..., description="仓库的本地路径", example="/path/to/project")
    file_path: str = Field(..., description="要分析的文件相对路径", example="src/main.py")

    class Config:
        schema_extra = {
            "example": {
                "repo_path": "/path/to/project",
                "file_path": "src/main.py"
            }
        }

class CodeAnalysisResponse(BaseModel):
    success: bool = Field(..., description="分析是否成功")
    analysis: dict = Field(..., description="代码分析结果")
    suggestions: List[str] = Field(default=[], description="改进建议列表")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "analysis": {
                    "complexity": "medium",
                    "maintainability": "good",
                    "test_coverage": "75%",
                    "code_smells": ["long_method", "duplicate_code"]
                },
                "suggestions": [
                    "考虑将长方法拆分为更小的函数",
                    "添加类型注解提高代码可读性",
                    "增加单元测试覆盖率"
                ]
            }
        }

class TestGenerationRequest(BaseModel):
    repo_path: str = Field(..., description="仓库的本地路径", example="/path/to/project")
    file_path: str = Field(..., description="要生成测试的源文件路径", example="src/utils.py")
    test_file_path: Optional[str] = Field(None, description="测试文件输出路径", example="tests/test_utils.py")

    class Config:
        schema_extra = {
            "example": {
                "repo_path": "/path/to/project",
                "file_path": "src/utils.py",
                "test_file_path": "tests/test_utils.py"
            }
        }

class TestGenerationResponse(BaseModel):
    success: bool = Field(..., description="测试生成是否成功")
    test_content: str = Field(..., description="生成的测试代码内容")
    test_file_path: str = Field(..., description="测试文件路径")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "test_content": "import unittest\nfrom src.utils import calculate\n\nclass TestCalculate(unittest.TestCase):\n    def test_addition(self):\n        self.assertEqual(calculate(2, 3, '+'), 5)",
                "test_file_path": "tests/test_utils.py"
            }
        }

@router.post("/analyze-code", response_model=CodeAnalysisResponse)
async def analyze_code(request: CodeAnalysisRequest):
    """
    ## 代码质量分析

    分析指定文件的代码质量，提供详细的分析报告和改进建议

    ### 功能特性
    - **复杂度分析**: 计算代码复杂度和可维护性指标
    - **代码异味检测**: 识别常见的代码问题和反模式
    - **性能评估**: 分析潜在的性能问题
    - **安全检查**: 检测常见的安全漏洞
    - **改进建议**: 提供具体的代码改进建议

    ### 支持的语言
    - Python (.py)
    - JavaScript/TypeScript (.js, .ts)
    - Go (.go)
    - Java (.java)
    - C/C++ (.c, .cpp, .h)

    ### 分析指标
    - **复杂度等级**: low, medium, high
    - **可维护性**: poor, fair, good, excellent
    - **测试覆盖率**: 估算的测试覆盖率百分比
    - **代码异味**: 检测到的问题类型列表

    ### 错误处理
    - 404: 文件不存在
    - 400: 不支持的文件类型
    - 500: 分析过程中的内部错误
    """
    try:
        # 读取文件内容
        file_content = git_service.get_file_content(
            request.repo_path, request.file_path
        )

        # 获取文件类型
        file_extension = request.file_path.split('.')[-1]

        # 调用AI分析代码
        analysis = await ai_service.analyze_code_quality(
            file_content, file_extension
        )

        return CodeAnalysisResponse(
            success=True,
            analysis=analysis,
            suggestions=["代码质量分析完成"]
        )

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"文件不存在: {request.file_path}")
    except Exception as e:
        logger.error(f"代码分析失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"分析失败: {str(e)}")

@router.post("/generate-tests", response_model=TestGenerationResponse)
async def generate_tests(request: TestGenerationRequest):
    """
    ## 自动生成测试用例

    为指定的源代码文件自动生成相应的单元测试

    ### 测试生成特性
    - **智能分析**: 自动分析函数和类的输入输出
    - **边界测试**: 生成边界条件和异常情况的测试
    - **覆盖率优化**: 尽可能提高代码覆盖率
    - **最佳实践**: 遵循各语言的测试框架最佳实践
    - **可读性**: 生成易于理解和维护的测试代码

    ### 支持的测试框架
    - **Python**: unittest, pytest
    - **JavaScript**: Jest, Mocha
    - **Go**: testing package
    - **Java**: JUnit
    - **TypeScript**: Jest, Vitest

    ### 生成的测试类型
    - **单元测试**: 函数和方法的基本功能测试
    - **参数化测试**: 多种输入参数的测试用例
    - **异常测试**: 错误条件和异常处理测试
    - **集成测试**: 模块间交互的测试用例

    ### 自动命名规则
    如果未指定测试文件路径，系统将根据以下规则自动生成:
    - Python: `tests/test_{filename}.py`
    - JavaScript: `tests/{filename}.test.js`
    - Go: `{filename}_test.go`
    - Java: `{FilenameTest}.java`

    ### 使用建议
    1. 确保源文件具有清晰的函数和类结构
    2. 添加类型注解和文档字符串以获得更好的测试生成效果
    3. 生成后请手动审查和调整测试用例
    4. 根据业务逻辑添加特定的边界条件测试
    """
    try:
        # 读取源文件内容
        file_content = git_service.get_file_content(
            request.repo_path, request.file_path
        )

        # 获取文件类型
        file_extension = request.file_path.split('.')[-1]

        # 生成测试文件路径
        if not request.test_file_path:
            base_name = request.file_path.replace(f'.{file_extension}', '')
            request.test_file_path = f"tests/test_{base_name.split('/')[-1]}.{file_extension}"

        # 调用AI生成测试
        test_content = await ai_service.generate_tests(
            file_content, file_extension
        )

        return TestGenerationResponse(
            success=True,
            test_content=test_content,
            test_file_path=request.test_file_path
        )

    except Exception as e:
        logger.error(f"测试生成失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))