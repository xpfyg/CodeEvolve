from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os
from dotenv import load_dotenv
import logging

from git_service import GitService
from ai_service import AIService
from api_routes import router

load_dotenv()

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Code Generator Service",
    description="""
    ## AI驱动的代码修改和GitHub集成服务

    该服务提供以下功能:

    * **代码生成**: 基于需求自动生成和修改代码
    * **代码分析**: 分析代码质量并提供改进建议
    * **测试生成**: 自动为代码生成相应的测试用例
    * **Git集成**: 自动创建分支、提交和推送代码更改
    * **仓库管理**: 查看分支、文件列表等仓库信息

    ### 使用方式
    1. 使用 `/generate-code` 端点生成代码
    2. 使用 `/api/v1/analyze-code` 分析代码质量
    3. 使用 `/api/v1/generate-tests` 生成测试用例
    4. 使用仓库管理端点查看项目信息
    """,
    version="1.0.0",
    contact={
        "name": "CodeEvolve Team",
        "email": "support@codeevolve.com",
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT",
    },
    servers=[
        {
            "url": "http://localhost:8000",
            "description": "Development server"
        },
        {
            "url": "https://api.codeevolve.com",
            "description": "Production server"
        }
    ]
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含API路由
app.include_router(router)

# 初始化服务
git_service = GitService()
ai_service = AIService()

class CodeModificationRequest(BaseModel):
    requirement: str = Field(..., description="功能需求的自然语言描述", example="添加用户认证功能，包括登录和注册接口")
    repo_path: str = Field(..., description="目标仓库的本地路径", example="/path/to/your/project")
    target_files: list[str] = Field(default=[], description="可选，指定要修改的文件列表", example=["src/auth.py", "src/models/user.py"])
    branch_name: str = Field(None, description="可选，自定义分支名称", example="feature-user-auth")

    class Config:
        schema_extra = {
            "example": {
                "requirement": "添加用户认证功能，包括登录和注册接口",
                "repo_path": "/path/to/your/project",
                "target_files": ["src/auth.py", "src/models/user.py"],
                "branch_name": "feature-user-auth"
            }
        }

class CodeModificationResponse(BaseModel):
    success: bool = Field(..., description="操作是否成功")
    branch_name: str = Field(..., description="创建的Git分支名称")
    commit_hash: str = Field(None, description="Git提交的哈希值")
    message: str = Field(..., description="操作结果消息")
    modified_files: list[str] = Field(default=[], description="被修改的文件列表")

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "branch_name": "feature-user-auth",
                "commit_hash": "abc123def456",
                "message": "成功生成代码并推送到分支 feature-user-auth",
                "modified_files": ["src/auth.py", "src/models/user.py", "tests/test_auth.py"]
            }
        }

class RepositoryBranchesResponse(BaseModel):
    branches: list[str] = Field(..., description="仓库中的分支列表")

    class Config:
        schema_extra = {
            "example": {
                "branches": ["main", "develop", "feature-user-auth", "bugfix-login-issue"]
            }
        }

class RepositoryFilesResponse(BaseModel):
    files: list[str] = Field(..., description="仓库中的文件列表")

    class Config:
        schema_extra = {
            "example": {
                "files": [
                    "src/main.py",
                    "src/models/user.py",
                    "src/api/routes.py",
                    "tests/test_main.py",
                    "requirements.txt",
                    "README.md"
                ]
            }
        }

@app.get("/", tags=["Health"])
async def root():
    """
    ## 服务根端点

    返回服务基本信息和状态
    """
    return {"message": "AI Code Generator Service", "version": "1.0.0", "status": "active"}

@app.get("/health", tags=["Health"])
async def health_check():
    """
    ## 健康检查端点

    检查服务运行状态，用于监控和负载均衡器健康检查

    ### 返回值
    - **status**: 服务状态 (healthy/unhealthy)
    - **service**: 服务名称
    - **timestamp**: 检查时间戳
    """
    import time
    return {
        "status": "healthy",
        "service": "ai-code-generator",
        "timestamp": int(time.time()),
        "uptime": "Service is running"
    }

@app.post("/generate-code", response_model=CodeModificationResponse, tags=["Code Generation"])
async def generate_code(request: CodeModificationRequest):
    """
    ## 生成和修改代码

    根据自然语言需求描述，自动生成或修改代码文件

    ### 功能说明
    1. **创建分支**: 在指定仓库创建新的Git分支
    2. **代码分析**: 分析现有代码结构和上下文
    3. **AI生成**: 使用AI模型生成符合需求的代码
    4. **文件写入**: 将生成的代码写入到目标文件
    5. **Git提交**: 自动提交更改并推送到远程仓库

    ### 请求参数
    - **requirement**: 功能需求描述 (自然语言)
    - **repo_path**: 目标仓库的本地路径
    - **target_files**: 可选，指定要修改的文件列表
    - **branch_name**: 可选，自定义分支名称

    ### 示例请求
    ```json
    {
        "requirement": "添加用户认证功能，包括登录和注册接口",
        "repo_path": "/path/to/your/project",
        "target_files": ["src/auth.py", "src/models/user.py"],
        "branch_name": "feature-user-auth"
    }
    ```

    ### 响应说明
    - **success**: 操作是否成功
    - **branch_name**: 创建的分支名称
    - **commit_hash**: Git提交哈希值
    - **message**: 操作结果消息
    - **modified_files**: 被修改的文件列表
    """
    try:
        logger.info(f"开始处理代码生成请求: {request.requirement}")

        # 1. 创建分支
        branch_name = request.branch_name or f"ai-feature-{int(__import__('time').time())}"
        git_service.create_branch(request.repo_path, branch_name)

        # 2. 分析现有代码结构
        code_context = git_service.analyze_codebase(request.repo_path)

        # 3. 调用AI生成代码
        modifications = await ai_service.generate_code_modifications(
            requirement=request.requirement,
            code_context=code_context,
            target_files=request.target_files
        )

        # 4. 应用代码修改
        modified_files = []
        for file_path, content in modifications.items():
            full_path = os.path.join(request.repo_path, file_path)
            os.makedirs(os.path.dirname(full_path), exist_ok=True)

            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            modified_files.append(file_path)

        # 5. 提交并推送
        commit_message = f"AI生成: {request.requirement}"
        commit_hash = git_service.commit_and_push(
            request.repo_path,
            branch_name,
            commit_message,
            modified_files
        )

        logger.info(f"代码生成完成，分支: {branch_name}, 提交: {commit_hash}")

        return CodeModificationResponse(
            success=True,
            branch_name=branch_name,
            commit_hash=commit_hash,
            message=f"成功生成代码并推送到分支 {branch_name}",
            modified_files=modified_files
        )

    except Exception as e:
        logger.error(f"代码生成失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/repos/{repo_path:path}/branches", response_model=RepositoryBranchesResponse, tags=["Repository Management"])
async def list_branches(repo_path: str):
    """
    ## 列出仓库分支

    获取指定Git仓库的所有分支列表

    ### 路径参数
    - **repo_path**: 仓库的本地路径

    ### 响应示例
    ```json
    {
        "branches": [
            "main",
            "feature-user-auth",
            "bugfix-login-issue",
            "develop"
        ]
    }
    ```

    ### 注意事项
    - 仓库路径必须是有效的Git仓库
    - 返回的分支包括本地和远程分支
    """
    try:
        branches = git_service.list_branches(repo_path)
        return RepositoryBranchesResponse(branches=branches)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/repos/{repo_path:path}/files", response_model=RepositoryFilesResponse, tags=["Repository Management"])
async def list_files(repo_path: str, extension: str = None):
    """
    ## 列出仓库文件

    获取指定仓库中的文件列表，支持按文件扩展名过滤

    ### 路径参数
    - **repo_path**: 仓库的本地路径

    ### 查询参数
    - **extension**: 可选，文件扩展名过滤器 (如: py, js, go)

    ### 响应示例
    ```json
    {
        "files": [
            "src/main.py",
            "src/models/user.py",
            "src/api/routes.py",
            "tests/test_main.py"
        ]
    }
    ```

    ### 使用场景
    - 查看项目结构
    - 选择要修改的目标文件
    - 代码审查和分析
    """
    try:
        files = git_service.list_files(repo_path, extension)
        return RepositoryFilesResponse(files=files)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)