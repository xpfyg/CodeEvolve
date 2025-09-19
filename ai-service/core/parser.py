"""
需求解析器
将自然语言需求转换为技术指令
"""

import re
import json
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

from models.schemas import TechnicalInstruction, RequirementAnalysis, ValidationResult

logger = logging.getLogger(__name__)

@dataclass
class ParsedRequirement:
    """解析后的需求"""
    instructions: List[TechnicalInstruction]
    confidence: float
    suggestions: List[str]
    analysis: RequirementAnalysis

class RequirementParser:
    """需求解析器"""

    def __init__(self):
        self.feature_patterns = self._load_feature_patterns()
        self.tech_stack_mapping = self._load_tech_stack_mapping()

    def _load_feature_patterns(self) -> Dict[str, Dict]:
        """加载功能识别模式"""
        return {
            "pagination": {
                "patterns": [
                    r"分页|翻页|页码|每页.*条|page|pagination",
                    r"上一页|下一页|第.*页",
                    r"显示.*条记录"
                ],
                "category": "data_display",
                "complexity": "medium",
                "instructions": {
                    "frontend": "在列表组件中添加Pagination组件，设置每页数量和总数",
                    "backend": "接口添加page和pageSize参数，返回分页数据和总数"
                }
            },
            "search": {
                "patterns": [
                    r"搜索|查询|筛选|过滤|search|filter",
                    r"按.*搜索|根据.*查询",
                    r"模糊搜索|精确搜索"
                ],
                "category": "data_query",
                "complexity": "medium",
                "instructions": {
                    "frontend": "添加搜索输入框和搜索按钮，实现搜索状态管理",
                    "backend": "接口添加搜索参数，实现数据库模糊查询"
                }
            },
            "auth": {
                "patterns": [
                    r"登录|注册|认证|权限|auth|login|register",
                    r"用户管理|角色管理|权限控制",
                    r"JWT|token|session"
                ],
                "category": "security",
                "complexity": "high",
                "instructions": {
                    "frontend": "实现登录页面、权限判断和token管理",
                    "backend": "实现JWT认证、用户管理和权限中间件"
                }
            },
            "file_upload": {
                "patterns": [
                    r"上传|文件|图片|upload|file",
                    r"选择文件|拖拽上传|批量上传",
                    r"图片压缩|格式转换"
                ],
                "category": "file_handling",
                "complexity": "medium",
                "instructions": {
                    "frontend": "实现文件选择器、上传进度和预览功能",
                    "backend": "实现文件接收、存储和格式处理"
                }
            },
            "export": {
                "patterns": [
                    r"导出|下载|export|download",
                    r"Excel|CSV|PDF|导出.*格式",
                    r"数据导出|报表导出"
                ],
                "category": "data_export",
                "complexity": "medium",
                "instructions": {
                    "frontend": "添加导出按钮和下载进度提示",
                    "backend": "实现数据查询和文件生成接口"
                }
            },
            "realtime": {
                "patterns": [
                    r"实时|推送|通知|websocket|socket",
                    r"即时更新|实时刷新|消息推送",
                    r"在线状态|实时聊天"
                ],
                "category": "realtime",
                "complexity": "high",
                "instructions": {
                    "frontend": "建立WebSocket连接，处理实时消息",
                    "backend": "实现WebSocket服务和消息推送"
                }
            },
            "performance": {
                "patterns": [
                    r"优化|性能|加载|速度|缓存|cache",
                    r"懒加载|虚拟滚动|代码分割",
                    r"减少.*时间|提升.*性能"
                ],
                "category": "optimization",
                "complexity": "high",
                "instructions": {
                    "frontend": "实现懒加载、虚拟滚动或缓存优化",
                    "backend": "添加缓存层、优化查询或减少API调用"
                }
            }
        }

    def _load_tech_stack_mapping(self) -> Dict[str, List[str]]:
        """加载技术栈映射"""
        return {
            "react": ["React", "JSX", "hooks", "state", "props", "component"],
            "vue": ["Vue", "template", "computed", "watch", "directive"],
            "angular": ["Angular", "component", "service", "module", "directive"],
            "golang": ["Go", "gin", "gorm", "struct", "goroutine", "channel"],
            "java": ["Java", "Spring", "MyBatis", "Maven", "annotation"],
            "python": ["Python", "Django", "Flask", "FastAPI", "decorator"],
            "node": ["Node.js", "Express", "npm", "middleware", "async/await"],
            "database": ["MySQL", "PostgreSQL", "MongoDB", "Redis", "SQL"]
        }

    async def parse_requirement(
        self,
        requirement: str,
        context: Optional[Dict[str, Any]] = None,
        language: str = "zh"
    ) -> ParsedRequirement:
        """解析用户需求"""
        try:
            logger.info(f"Parsing requirement: {requirement}")

            # 分析需求
            analysis = self._analyze_requirement(requirement, context)

            # 识别功能特征
            features = self._identify_features(requirement)

            # 生成技术指令
            instructions = self._generate_instructions(features, analysis, context)

            # 计算置信度
            confidence = self._calculate_confidence(features, analysis)

            # 生成建议
            suggestions = self._generate_suggestions(analysis, features)

            return ParsedRequirement(
                instructions=instructions,
                confidence=confidence,
                suggestions=suggestions,
                analysis=analysis
            )

        except Exception as e:
            logger.error(f"Failed to parse requirement: {e}")
            raise

    def _analyze_requirement(self, requirement: str, context: Optional[Dict] = None) -> RequirementAnalysis:
        """分析需求内容"""
        # 基础分析
        word_count = len(requirement.split())
        has_technical_terms = self._has_technical_terms(requirement)

        # 识别需求类型
        req_type = self._identify_requirement_type(requirement)

        # 识别技术栈
        tech_stack = self._identify_tech_stack(requirement, context)

        # 评估复杂度
        complexity = self._assess_complexity(requirement, req_type)

        return RequirementAnalysis(
            requirement_type=req_type,
            tech_stack=tech_stack,
            complexity=complexity,
            word_count=word_count,
            has_technical_terms=has_technical_terms,
            timestamp=datetime.now()
        )

    def _identify_features(self, requirement: str) -> List[str]:
        """识别功能特征"""
        identified_features = []

        for feature_name, feature_config in self.feature_patterns.items():
            for pattern in feature_config["patterns"]:
                if re.search(pattern, requirement, re.IGNORECASE):
                    identified_features.append(feature_name)
                    break

        return list(set(identified_features))  # 去重

    def _generate_instructions(
        self,
        features: List[str],
        analysis: RequirementAnalysis,
        context: Optional[Dict] = None
    ) -> List[TechnicalInstruction]:
        """生成技术指令"""
        instructions = []

        for feature in features:
            if feature in self.feature_patterns:
                feature_config = self.feature_patterns[feature]

                # 根据技术栈生成具体指令
                if "react" in analysis.tech_stack or "frontend" in analysis.tech_stack:
                    instructions.append(TechnicalInstruction(
                        type="frontend",
                        action=feature_config["instructions"].get("frontend", ""),
                        target="component",
                        priority="medium",
                        estimated_time="2-4 hours",
                        dependencies=[]
                    ))

                if "golang" in analysis.tech_stack or "backend" in analysis.tech_stack:
                    instructions.append(TechnicalInstruction(
                        type="backend",
                        action=feature_config["instructions"].get("backend", ""),
                        target="api",
                        priority="medium",
                        estimated_time="1-3 hours",
                        dependencies=[]
                    ))

        # 如果没有识别到具体功能，生成通用指令
        if not instructions:
            instructions.append(TechnicalInstruction(
                type="general",
                action="根据需求描述实现相应功能",
                target="code",
                priority="medium",
                estimated_time="4-8 hours",
                dependencies=[]
            ))

        return instructions

    def _identify_requirement_type(self, requirement: str) -> str:
        """识别需求类型"""
        if re.search(r"添加|新增|实现|开发|add|implement", requirement, re.IGNORECASE):
            return "feature_addition"
        elif re.search(r"优化|改进|提升|性能|optimize|improve", requirement, re.IGNORECASE):
            return "optimization"
        elif re.search(r"修复|修改|bug|fix|change", requirement, re.IGNORECASE):
            return "bug_fix"
        elif re.search(r"重构|重写|refactor|rewrite", requirement, re.IGNORECASE):
            return "refactoring"
        else:
            return "general"

    def _identify_tech_stack(self, requirement: str, context: Optional[Dict] = None) -> List[str]:
        """识别技术栈"""
        tech_stack = []

        # 从上下文中获取技术栈
        if context and "tech_stack" in context:
            tech_stack.extend(context["tech_stack"])

        # 从需求描述中识别技术栈
        for tech, keywords in self.tech_stack_mapping.items():
            for keyword in keywords:
                if keyword.lower() in requirement.lower():
                    tech_stack.append(tech)
                    break

        return list(set(tech_stack))  # 去重

    def _assess_complexity(self, requirement: str, req_type: str) -> str:
        """评估复杂度"""
        # 基于关键词评估
        complexity_score = 0

        high_complexity_patterns = [
            r"权限|认证|安全|实时|websocket|分布式|微服务",
            r"大数据|高并发|性能优化|架构设计"
        ]

        medium_complexity_patterns = [
            r"数据库|接口|API|前端|后端|文件上传|导出",
            r"分页|搜索|筛选|表单|列表"
        ]

        for pattern in high_complexity_patterns:
            if re.search(pattern, requirement, re.IGNORECASE):
                complexity_score += 3

        for pattern in medium_complexity_patterns:
            if re.search(pattern, requirement, re.IGNORECASE):
                complexity_score += 1

        # 基于需求类型调整
        if req_type in ["optimization", "refactoring"]:
            complexity_score += 1

        if complexity_score >= 3:
            return "high"
        elif complexity_score >= 1:
            return "medium"
        else:
            return "low"

    def _has_technical_terms(self, requirement: str) -> bool:
        """检查是否包含技术术语"""
        technical_terms = [
            "API", "接口", "数据库", "前端", "后端", "组件", "模块",
            "函数", "方法", "类", "对象", "数组", "字符串", "JSON",
            "HTTP", "GET", "POST", "PUT", "DELETE", "token", "session"
        ]

        return any(term.lower() in requirement.lower() for term in technical_terms)

    def _calculate_confidence(self, features: List[str], analysis: RequirementAnalysis) -> float:
        """计算解析置信度"""
        confidence = 0.5  # 基础置信度

        # 如果识别到具体功能特征，提升置信度
        if features:
            confidence += 0.3

        # 如果包含技术术语，提升置信度
        if analysis.has_technical_terms:
            confidence += 0.2

        # 如果识别到技术栈，提升置信度
        if analysis.tech_stack:
            confidence += 0.1

        # 如果需求描述较详细，提升置信度
        if analysis.word_count > 10:
            confidence += 0.1

        return min(confidence, 1.0)

    def _generate_suggestions(self, analysis: RequirementAnalysis, features: List[str]) -> List[str]:
        """生成优化建议"""
        suggestions = []

        # 基于复杂度给出建议
        if analysis.complexity == "high":
            suggestions.append("建议将复杂需求拆分为多个子任务，分步实现")

        # 基于需求类型给出建议
        if analysis.requirement_type == "general":
            suggestions.append("建议提供更具体的功能描述和技术要求")

        # 基于技术栈给出建议
        if not analysis.tech_stack:
            suggestions.append("建议明确项目的技术栈，以便生成更准确的实现方案")

        # 基于功能特征给出建议
        if not features:
            suggestions.append("建议使用更具体的功能词汇，如'添加分页'、'实现搜索'等")

        # 基于描述长度给出建议
        if analysis.word_count < 5:
            suggestions.append("建议提供更详细的需求描述，包括具体功能和预期效果")

        return suggestions

    async def validate_requirement(
        self,
        requirement: str,
        context: Optional[Dict[str, Any]] = None
    ) -> ValidationResult:
        """验证需求描述的合理性"""
        issues = []
        suggestions = []

        # 检查长度
        if len(requirement.strip()) < 10:
            issues.append("需求描述过于简短")
            suggestions.append("请提供更详细的需求描述")

        # 检查是否包含具体动作
        action_words = ["添加", "实现", "优化", "修改", "删除", "创建", "开发"]
        if not any(word in requirement for word in action_words):
            issues.append("缺少明确的动作指令")
            suggestions.append("请明确说明要执行什么操作，如'添加'、'优化'等")

        # 检查是否包含目标对象
        target_words = ["页面", "组件", "接口", "功能", "模块", "系统"]
        if not any(word in requirement for word in target_words):
            issues.append("缺少明确的操作目标")
            suggestions.append("请指明要操作的具体对象，如'用户管理页面'、'登录接口'等")

        # 计算清晰度评分
        clarity_score = 1.0
        if issues:
            clarity_score -= len(issues) * 0.2
        clarity_score = max(clarity_score, 0.0)

        return ValidationResult(
            is_valid=len(issues) == 0,
            issues=issues,
            suggestions=suggestions,
            clarity_score=clarity_score
        )