"""
代码生成器
基于技术指令生成高质量代码
"""

import logging
import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

from models.schemas import (
    TechnicalInstruction, CodeContext, GeneratedCode,
    InstructionType, TaskStatus
)

logger = logging.getLogger(__name__)

@dataclass
class GenerationResult:
    """代码生成结果"""
    generated_files: List[GeneratedCode]
    summary: str
    warnings: List[str]

@dataclass
class CustomizationResult:
    """代码定制结果"""
    customized_code: str
    changes: List[str]
    explanation: str
    confidence: float

class CodeGenerator:
    """代码生成器"""

    def __init__(self):
        self.templates = self._load_templates()
        self.patterns = self._load_patterns()

    def _load_templates(self) -> Dict[str, Dict[str, str]]:
        """加载代码模板"""
        return {
            "react": {
                "component": '''import React from 'react';

const {component_name} = () => {
  return (
    <div className="{component_name.lower()}">
      <h1>{title}</h1>
      {content}
    </div>
  );
};

export default {component_name};''',
                "hook": '''import { useState, useEffect } from 'react';

const use{hook_name} = () => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Effect logic here
  }, []);

  return { state, setState };
};

export default use{hook_name};'''
            },
            "fastapi": {
                "router": '''from fastapi import APIRouter, HTTPException
from typing import List, Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/{endpoint}")
async def get_{resource}():
    """Get {resource} list"""
    try:
        # Implementation here
        return {"message": "Success"}
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))''',
                "model": '''from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class {model_name}(BaseModel):
    """{ model_description}"""
    id: Optional[int] = Field(None, description="ID")
    name: str = Field(..., description="Name")
    created_at: datetime = Field(default_factory=datetime.now)'''
            },
            "golang": {
                "handler": '''package main

import (
    "encoding/json"
    "net/http"
    "log"
)

type {struct_name} struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
}

func {handler_name}(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")

    // Handler logic here

    response := {struct_name}{ID: 1, Name: "Example"}
    json.NewEncoder(w).Encode(response)
}''',
                "struct": '''type {struct_name} struct {
    {fields}
}

func New{struct_name}() *{struct_name} {
    return &{struct_name}{}
}'''
            }
        }

    def _load_patterns(self) -> Dict[str, Dict]:
        """加载生成模式"""
        return {
            "crud": {
                "operations": ["create", "read", "update", "delete"],
                "frontend": "列表页面 + 详情页面 + 表单页面",
                "backend": "增删改查API接口 + 数据模型"
            },
            "auth": {
                "components": ["login", "register", "profile", "permissions"],
                "frontend": "认证页面 + 权限组件 + 路由守卫",
                "backend": "JWT认证 + 用户管理 + 权限中间件"
            },
            "dashboard": {
                "components": ["charts", "tables", "cards", "filters"],
                "frontend": "仪表盘页面 + 图表组件 + 数据展示",
                "backend": "数据统计API + 数据聚合"
            }
        }

    async def generate_code(
        self,
        instructions: List[TechnicalInstruction],
        context: CodeContext,
        preferences: Optional[Dict[str, Any]] = None
    ) -> GenerationResult:
        """生成代码"""
        try:
            logger.info(f"Generating code with {len(instructions)} instructions")

            generated_files = []
            warnings = []

            for instruction in instructions:
                files = await self._generate_from_instruction(instruction, context, preferences)
                generated_files.extend(files)

            # 生成摘要
            summary = self._generate_summary(instructions, generated_files)

            return GenerationResult(
                generated_files=generated_files,
                summary=summary,
                warnings=warnings
            )

        except Exception as e:
            logger.error(f"Failed to generate code: {e}")
            raise

    async def _generate_from_instruction(
        self,
        instruction: TechnicalInstruction,
        context: CodeContext,
        preferences: Optional[Dict[str, Any]] = None
    ) -> List[GeneratedCode]:
        """根据单个指令生成代码"""
        generated_files = []

        if instruction.type == InstructionType.FRONTEND:
            files = await self._generate_frontend_code(instruction, context, preferences)
            generated_files.extend(files)

        elif instruction.type == InstructionType.BACKEND:
            files = await self._generate_backend_code(instruction, context, preferences)
            generated_files.extend(files)

        elif instruction.type == InstructionType.DATABASE:
            files = await self._generate_database_code(instruction, context, preferences)
            generated_files.extend(files)

        else:  # GENERAL
            files = await self._generate_general_code(instruction, context, preferences)
            generated_files.extend(files)

        return generated_files

    async def _generate_frontend_code(
        self,
        instruction: TechnicalInstruction,
        context: CodeContext,
        preferences: Optional[Dict[str, Any]] = None
    ) -> List[GeneratedCode]:
        """生成前端代码"""
        files = []

        # 识别框架
        framework = context.framework or "react"

        if "分页" in instruction.action or "pagination" in instruction.action.lower():
            # 生成分页组件
            if framework.lower() == "react":
                content = self._generate_react_pagination()
                files.append(GeneratedCode(
                    file_path="components/Pagination.jsx",
                    content=content,
                    language="javascript",
                    description="React分页组件",
                    changes=["添加分页功能组件"]
                ))

        elif "搜索" in instruction.action or "search" in instruction.action.lower():
            # 生成搜索组件
            if framework.lower() == "react":
                content = self._generate_react_search()
                files.append(GeneratedCode(
                    file_path="components/SearchBox.jsx",
                    content=content,
                    language="javascript",
                    description="React搜索组件",
                    changes=["添加搜索功能组件"]
                ))

        return files

    async def _generate_backend_code(
        self,
        instruction: TechnicalInstruction,
        context: CodeContext,
        preferences: Optional[Dict[str, Any]] = None
    ) -> List[GeneratedCode]:
        """生成后端代码"""
        files = []

        language = context.language or "python"

        if "接口" in instruction.action or "api" in instruction.action.lower():
            if language.lower() == "python":
                content = self._generate_python_api()
                files.append(GeneratedCode(
                    file_path="api/routes.py",
                    content=content,
                    language="python",
                    description="Python API接口",
                    changes=["添加API接口实现"]
                ))

        return files

    async def _generate_database_code(
        self,
        instruction: TechnicalInstruction,
        context: CodeContext,
        preferences: Optional[Dict[str, Any]] = None
    ) -> List[GeneratedCode]:
        """生成数据库代码"""
        files = []

        # 生成数据库模型或迁移脚本
        content = self._generate_database_schema()
        files.append(GeneratedCode(
            file_path="models/schema.sql",
            content=content,
            language="sql",
            description="数据库模式定义",
            changes=["添加数据表结构"]
        ))

        return files

    async def _generate_general_code(
        self,
        instruction: TechnicalInstruction,
        context: CodeContext,
        preferences: Optional[Dict[str, Any]] = None
    ) -> List[GeneratedCode]:
        """生成通用代码"""
        files = []

        # 根据指令内容生成相应的代码
        content = f"""
# 根据需求生成的代码
# 指令: {instruction.action}
# 目标: {instruction.target}

def implement_requirement():
    '''
    实现需求: {instruction.action}
    '''
    # TODO: 根据具体需求实现功能
    pass
"""

        files.append(GeneratedCode(
            file_path="generated/implementation.py",
            content=content,
            language="python",
            description="通用实现代码",
            changes=["生成基础实现框架"]
        ))

        return files

    def _generate_react_pagination(self) -> str:
        """生成React分页组件"""
        return '''import React from 'react';
import './Pagination.css';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 20,
  total = 0
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        共 {total} 条记录，每页 {pageSize} 条
      </div>
      <div className="pagination">
        <button
          className="page-btn"
          disabled={currentPage === 1}
          onClick={() => handlePageClick(currentPage - 1)}
        >
          上一页
        </button>

        {getVisiblePages().map((page, index) => (
          <button
            key={index}
            className={`page-btn ${page === currentPage ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
            onClick={() => handlePageClick(page)}
            disabled={page === '...'}
          >
            {page}
          </button>
        ))}

        <button
          className="page-btn"
          disabled={currentPage === totalPages}
          onClick={() => handlePageClick(currentPage + 1)}
        >
          下一页
        </button>
      </div>
    </div>
  );
};

export default Pagination;'''

    def _generate_react_search(self) -> str:
        """生成React搜索组件"""
        return '''import React, { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import './SearchBox.css';

const SearchBox = ({
  onSearch,
  placeholder = "请输入搜索关键词",
  debounceTime = 300,
  allowClear = true
}) => {
  const [searchValue, setSearchValue] = useState('');

  // 防抖搜索
  const debouncedSearch = useCallback(
    debounce((value) => {
      onSearch(value);
    }, debounceTime),
    [onSearch, debounceTime]
  );

  useEffect(() => {
    debouncedSearch(searchValue);

    // 清理防抖
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchValue, debouncedSearch]);

  const handleChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleClear = () => {
    setSearchValue('');
    onSearch('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch(searchValue);
    }
  };

  return (
    <div className="search-box">
      <div className="search-input-container">
        <input
          type="text"
          className="search-input"
          value={searchValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
        />
        {allowClear && searchValue && (
          <button className="clear-btn" onClick={handleClear}>
            ×
          </button>
        )}
        <button
          className="search-btn"
          onClick={() => onSearch(searchValue)}
        >
          🔍
        </button>
      </div>
    </div>
  );
};

export default SearchBox;'''

    def _generate_python_api(self) -> str:
        """生成Python API代码"""
        return '''from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class PaginationParams(BaseModel):
    """分页参数"""
    page: int = Query(1, ge=1, description="页码")
    page_size: int = Query(20, ge=1, le=100, description="每页大小")

class SearchParams(BaseModel):
    """搜索参数"""
    q: Optional[str] = Query(None, description="搜索关键词")
    field: Optional[str] = Query(None, description="搜索字段")

@router.get("/items")
async def get_items(
    pagination: PaginationParams = Depends(),
    search: SearchParams = Depends()
):
    """获取项目列表"""
    try:
        # 构建查询条件
        filters = {}
        if search.q:
            filters['search'] = search.q
        if search.field:
            filters['field'] = search.field

        # 计算偏移量
        offset = (pagination.page - 1) * pagination.page_size

        # 执行查询 (这里需要根据实际数据库实现)
        # items = await query_items(filters, offset, pagination.page_size)
        # total = await count_items(filters)

        # 模拟数据
        items = [{"id": i, "name": f"Item {i}"} for i in range(10)]
        total = 100

        return {
            "items": items,
            "pagination": {
                "page": pagination.page,
                "page_size": pagination.page_size,
                "total": total,
                "total_pages": (total + pagination.page_size - 1) // pagination.page_size
            }
        }

    except Exception as e:
        logger.error(f"Failed to get items: {e}")
        raise HTTPException(status_code=500, detail="获取数据失败")

@router.post("/items")
async def create_item(item_data: dict):
    """创建新项目"""
    try:
        # 验证数据
        if not item_data.get('name'):
            raise HTTPException(status_code=400, detail="名称不能为空")

        # 创建项目 (这里需要根据实际数据库实现)
        # new_item = await create_item_in_db(item_data)

        # 模拟创建
        new_item = {"id": 1, **item_data}

        return {"message": "创建成功", "item": new_item}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create item: {e}")
        raise HTTPException(status_code=500, detail="创建失败")'''

    def _generate_database_schema(self) -> str:
        """生成数据库模式"""
        return '''-- 用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 项目表
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_items_user_id ON items(user_id);
CREATE INDEX idx_items_status ON items(status);

-- 创建触发器更新updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();'''

    def _generate_summary(self, instructions: List[TechnicalInstruction], files: List[GeneratedCode]) -> str:
        """生成代码生成摘要"""
        file_count = len(files)
        instruction_count = len(instructions)

        languages = list(set(f.language for f in files))

        return f"成功生成 {file_count} 个文件，涵盖 {', '.join(languages)} 等 {len(languages)} 种语言，实现了 {instruction_count} 项技术指令的要求。"

    async def customize_code(
        self,
        original_code: str,
        requirement: str,
        context: Dict[str, Any],
        options: Dict[str, Any]
    ) -> CustomizationResult:
        """定制代码"""
        try:
            logger.info(f"Customizing code: {requirement}")

            # 分析原始代码
            code_analysis = self._analyze_existing_code(original_code, context.get('language', 'python'))

            # 根据需求生成定制代码
            customized_code = self._apply_customization(original_code, requirement, code_analysis, options)

            # 生成变更说明
            changes = self._generate_change_description(original_code, customized_code, requirement)

            # 生成解释
            explanation = f"根据需求'{requirement}'对代码进行了定制，主要变更包括：" + "; ".join(changes)

            # 计算置信度
            confidence = self._calculate_customization_confidence(original_code, customized_code, requirement)

            return CustomizationResult(
                customized_code=customized_code,
                changes=changes,
                explanation=explanation,
                confidence=confidence
            )

        except Exception as e:
            logger.error(f"Failed to customize code: {e}")
            raise

    def _analyze_existing_code(self, code: str, language: str) -> Dict[str, Any]:
        """分析现有代码"""
        return {
            "language": language,
            "line_count": len(code.split('\n')),
            "has_functions": "def " in code or "function " in code,
            "has_classes": "class " in code,
            "has_imports": "import " in code or "#include" in code
        }

    def _apply_customization(
        self,
        original_code: str,
        requirement: str,
        analysis: Dict[str, Any],
        options: Dict[str, Any]
    ) -> str:
        """应用定制需求"""
        customized = original_code

        # 简单的定制逻辑示例
        if "添加注释" in requirement:
            customized = self._add_comments(customized)
        elif "优化性能" in requirement:
            customized = self._optimize_performance(customized)
        elif "重构" in requirement:
            customized = self._refactor_code(customized)

        return customized

    def _add_comments(self, code: str) -> str:
        """添加注释"""
        lines = code.split('\n')
        commented_lines = []

        for line in lines:
            if line.strip() and not line.strip().startswith('#'):
                if 'def ' in line:
                    commented_lines.append(line)
                    commented_lines.append(line.replace(line.lstrip(), '    """函数说明"""'))
                else:
                    commented_lines.append(line)
            else:
                commented_lines.append(line)

        return '\n'.join(commented_lines)

    def _optimize_performance(self, code: str) -> str:
        """性能优化"""
        # 简单的性能优化示例
        optimized = code.replace('for i in range(len(', 'for i, item in enumerate(')
        return optimized

    def _refactor_code(self, code: str) -> str:
        """重构代码"""
        # 简单的重构示例
        refactored = code.replace('    ', '  ')  # 将4空格缩进改为2空格
        return refactored

    def _generate_change_description(self, original: str, customized: str, requirement: str) -> List[str]:
        """生成变更描述"""
        changes = []

        if len(customized) > len(original):
            changes.append("增加了代码内容")
        elif len(customized) < len(original):
            changes.append("简化了代码结构")

        if "注释" in requirement:
            changes.append("添加了详细注释")
        if "优化" in requirement:
            changes.append("进行了性能优化")
        if "重构" in requirement:
            changes.append("重构了代码结构")

        return changes

    def _calculate_customization_confidence(self, original: str, customized: str, requirement: str) -> float:
        """计算定制置信度"""
        confidence = 0.7  # 基础置信度

        # 如果有明显的改动，提升置信度
        if original != customized:
            confidence += 0.2

        # 如果需求明确，提升置信度
        if any(keyword in requirement for keyword in ['添加', '优化', '修改', '重构']):
            confidence += 0.1

        return min(confidence, 1.0)