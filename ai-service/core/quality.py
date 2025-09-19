"""
代码质量检查器
提供代码质量分析、安全检查和优化建议
"""

import ast
import re
import logging
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

from models.schemas import (
    QualityIssue, QualityMetrics, TaskStatus, CodeContext
)

logger = logging.getLogger(__name__)

@dataclass
class QualityCheckResult:
    """质量检查结果"""
    overall_score: float
    issues: List[QualityIssue]
    metrics: QualityMetrics
    suggestions: List[str]

@dataclass
class ComplexityAnalysisResult:
    """复杂度分析结果"""
    complexity_metrics: Dict[str, float]
    hotspots: List[Dict[str, Any]]
    recommendations: List[str]

@dataclass
class SecurityScanResult:
    """安全扫描结果"""
    security_issues: List[Dict[str, Any]]
    severity_counts: Dict[str, int]
    recommendations: List[str]
    overall_risk: str

@dataclass
class OptimizationResult:
    """优化结果"""
    optimizations: List[Dict[str, Any]]
    estimated_improvements: Dict[str, str]
    priority_order: List[str]

class QualityChecker:
    """代码质量检查器"""

    def __init__(self):
        self.rules = self._load_quality_rules()
        self.security_patterns = self._load_security_patterns()
        self.performance_patterns = self._load_performance_patterns()

    def _load_quality_rules(self) -> Dict[str, Dict]:
        """加载质量规则"""
        return {
            "python": {
                "max_line_length": 88,
                "max_function_length": 50,
                "max_complexity": 10,
                "naming_patterns": {
                    "function": r"^[a-z_][a-z0-9_]*$",
                    "class": r"^[A-Z][a-zA-Z0-9]*$",
                    "constant": r"^[A-Z_][A-Z0-9_]*$"
                },
                "forbidden_patterns": [
                    r"eval\s*\(",  # 禁用eval
                    r"exec\s*\(",  # 禁用exec
                    r"__import__"  # 禁用动态导入
                ]
            },
            "javascript": {
                "max_line_length": 100,
                "max_function_length": 40,
                "max_complexity": 8,
                "naming_patterns": {
                    "function": r"^[a-z][a-zA-Z0-9]*$",
                    "class": r"^[A-Z][a-zA-Z0-9]*$",
                    "constant": r"^[A-Z_][A-Z0-9_]*$"
                },
                "forbidden_patterns": [
                    r"eval\s*\(",
                    r"innerHTML\s*=",
                    r"document\.write"
                ]
            },
            "golang": {
                "max_line_length": 120,
                "max_function_length": 60,
                "max_complexity": 12,
                "naming_patterns": {
                    "function": r"^[A-Z][a-zA-Z0-9]*$",  # 公共函数大写开头
                    "variable": r"^[a-z][a-zA-Z0-9]*$",
                    "constant": r"^[A-Z_][A-Z0-9_]*$"
                },
                "forbidden_patterns": [
                    r"unsafe\.",
                    r"reflect\."
                ]
            }
        }

    def _load_security_patterns(self) -> Dict[str, List[Dict]]:
        """加载安全检查模式"""
        return {
            "sql_injection": [
                {
                    "pattern": r"SELECT.*\+.*|INSERT.*\+.*|UPDATE.*\+.*|DELETE.*\+.*",
                    "message": "可能存在SQL注入风险，建议使用参数化查询",
                    "severity": "high"
                },
                {
                    "pattern": r"cursor\.execute\([^,]*%[^,]*\)",
                    "message": "使用字符串格式化构建SQL语句存在注入风险",
                    "severity": "high"
                }
            ],
            "xss": [
                {
                    "pattern": r"innerHTML\s*=.*\+|document\.write\s*\(",
                    "message": "直接操作DOM可能导致XSS攻击",
                    "severity": "medium"
                },
                {
                    "pattern": r"eval\s*\(|new\s+Function\s*\(",
                    "message": "动态代码执行存在安全风险",
                    "severity": "high"
                }
            ],
            "hardcoded_secrets": [
                {
                    "pattern": r"password\s*=\s*[\"'][\w]{6,}[\"']|api_key\s*=\s*[\"'][\w]{10,}[\"']",
                    "message": "代码中包含硬编码的密码或API密钥",
                    "severity": "high"
                },
                {
                    "pattern": r"(SECRET|PASSWORD|TOKEN|KEY)\s*=\s*[\"'][^\"']{8,}[\"']",
                    "message": "可能包含硬编码的敏感信息",
                    "severity": "medium"
                }
            ],
            "path_traversal": [
                {
                    "pattern": r"open\s*\([^,]*\+.*\)|read\s*\([^,]*\+.*\)",
                    "message": "文件路径拼接可能导致路径遍历攻击",
                    "severity": "medium"
                }
            ]
        }

    def _load_performance_patterns(self) -> Dict[str, List[Dict]]:
        """加载性能检查模式"""
        return {
            "inefficient_loops": [
                {
                    "pattern": r"for\s+\w+\s+in\s+range\s*\(\s*len\s*\(",
                    "message": "使用enumerate()替代range(len())更高效",
                    "optimization": "使用 for i, item in enumerate(list) 替代 for i in range(len(list))"
                }
            ],
            "repeated_calculations": [
                {
                    "pattern": r"len\s*\([^)]+\).*for.*len\s*\(\1\)",
                    "message": "循环中重复计算长度，建议提前计算",
                    "optimization": "将len()计算移出循环"
                }
            ],
            "memory_usage": [
                {
                    "pattern": r"\[\s*.*\s+for\s+.*\s+in\s+.*\]",
                    "message": "列表推导式可能消耗大量内存，考虑使用生成器",
                    "optimization": "对于大数据集，考虑使用生成器表达式"
                }
            ]
        }

    async def check_quality(
        self,
        code: str,
        language: str,
        check_types: List[str] = None,
        context: Optional[CodeContext] = None
    ) -> QualityCheckResult:
        """检查代码质量"""
        try:
            logger.info(f"Checking quality for {language} code")

            check_types = check_types or ["syntax", "style", "security", "performance"]
            issues = []
            suggestions = []

            # 语法检查
            if "syntax" in check_types:
                syntax_issues = await self._check_syntax(code, language)
                issues.extend(syntax_issues)

            # 代码风格检查
            if "style" in check_types:
                style_issues = await self._check_style(code, language)
                issues.extend(style_issues)

            # 安全检查
            if "security" in check_types:
                security_issues = await self._check_security(code, language)
                issues.extend(security_issues)

            # 性能检查
            if "performance" in check_types:
                performance_issues = await self._check_performance(code, language)
                issues.extend(performance_issues)

            # 计算质量指标
            metrics = await self._calculate_metrics(code, language)

            # 计算总体评分
            overall_score = self._calculate_overall_score(issues, metrics)

            # 生成改进建议
            suggestions = self._generate_quality_suggestions(issues, metrics)

            return QualityCheckResult(
                overall_score=overall_score,
                issues=issues,
                metrics=metrics,
                suggestions=suggestions
            )

        except Exception as e:
            logger.error(f"Failed to check code quality: {e}")
            raise

    async def _check_syntax(self, code: str, language: str) -> List[QualityIssue]:
        """语法检查"""
        issues = []

        if language.lower() == "python":
            try:
                ast.parse(code)
            except SyntaxError as e:
                issues.append(QualityIssue(
                    type="syntax",
                    severity="high",
                    message=f"语法错误: {e.msg}",
                    file_path="current_file",
                    line_number=e.lineno,
                    suggestion="修复语法错误"
                ))

        return issues

    async def _check_style(self, code: str, language: str) -> List[QualityIssue]:
        """代码风格检查"""
        issues = []
        rules = self.rules.get(language.lower(), {})

        if not rules:
            return issues

        lines = code.split('\n')

        for line_num, line in enumerate(lines, 1):
            # 检查行长度
            if len(line) > rules.get("max_line_length", 100):
                issues.append(QualityIssue(
                    type="style",
                    severity="low",
                    message=f"行长度超过 {rules['max_line_length']} 字符",
                    file_path="current_file",
                    line_number=line_num,
                    suggestion="将长行拆分为多行"
                ))

            # 检查命名规范
            if language.lower() == "python":
                # 检查函数命名
                if re.search(r"def\s+([A-Z][a-zA-Z0-9]*)", line):
                    issues.append(QualityIssue(
                        type="style",
                        severity="medium",
                        message="Python函数名应使用snake_case命名",
                        file_path="current_file",
                        line_number=line_num,
                        suggestion="使用小写字母和下划线命名函数"
                    ))

        return issues

    async def _check_security(self, code: str, language: str) -> List[QualityIssue]:
        """安全检查"""
        issues = []

        for category, patterns in self.security_patterns.items():
            for pattern_info in patterns:
                matches = re.finditer(pattern_info["pattern"], code, re.IGNORECASE | re.MULTILINE)
                for match in matches:
                    line_num = code[:match.start()].count('\n') + 1
                    issues.append(QualityIssue(
                        type="security",
                        severity=pattern_info["severity"],
                        message=f"[{category}] {pattern_info['message']}",
                        file_path="current_file",
                        line_number=line_num,
                        suggestion="修复安全漏洞"
                    ))

        return issues

    async def _check_performance(self, code: str, language: str) -> List[QualityIssue]:
        """性能检查"""
        issues = []

        for category, patterns in self.performance_patterns.items():
            for pattern_info in patterns:
                matches = re.finditer(pattern_info["pattern"], code, re.IGNORECASE | re.MULTILINE)
                for match in matches:
                    line_num = code[:match.start()].count('\n') + 1
                    issues.append(QualityIssue(
                        type="performance",
                        severity="medium",
                        message=f"[{category}] {pattern_info['message']}",
                        file_path="current_file",
                        line_number=line_num,
                        suggestion=pattern_info.get("optimization", "优化性能")
                    ))

        return issues

    async def _calculate_metrics(self, code: str, language: str) -> QualityMetrics:
        """计算质量指标"""
        lines = code.split('\n')
        non_empty_lines = [line for line in lines if line.strip()]

        # 计算复杂度评分（简化版）
        complexity_score = self._calculate_cyclomatic_complexity(code, language)

        # 计算可维护性评分
        maintainability = self._calculate_maintainability(code, language)

        # 计算性能评分
        performance_score = self._calculate_performance_score(code, language)

        # 计算安全评分
        security_score = self._calculate_security_score(code, language)

        return QualityMetrics(
            complexity_score=complexity_score,
            maintainability=maintainability,
            performance_score=performance_score,
            security_score=security_score
        )

    def _calculate_cyclomatic_complexity(self, code: str, language: str) -> float:
        """计算圈复杂度"""
        if language.lower() == "python":
            # 计算分支语句数量
            branches = len(re.findall(r'\b(if|elif|for|while|except|with)\b', code))
            # 简化的复杂度计算：基础复杂度1 + 分支数
            complexity = 1 + branches
            return min(complexity, 50.0)  # 限制最大值

        return 5.0  # 默认复杂度

    def _calculate_maintainability(self, code: str, language: str) -> float:
        """计算可维护性评分"""
        lines = code.split('\n')
        total_lines = len([line for line in lines if line.strip()])

        # 基于代码长度和注释比例的简化计算
        comment_lines = len([line for line in lines if line.strip().startswith('#')])
        comment_ratio = comment_lines / max(total_lines, 1)

        # 基础评分70，根据注释比例调整
        base_score = 70.0
        comment_bonus = min(comment_ratio * 30, 20)  # 最多加20分

        # 根据代码长度调整（过长的代码维护性较差）
        length_penalty = max(0, (total_lines - 100) * 0.1)

        maintainability = base_score + comment_bonus - length_penalty
        return max(0, min(maintainability, 100))

    def _calculate_performance_score(self, code: str, language: str) -> float:
        """计算性能评分"""
        # 简化的性能评分：基于是否使用了已知的低效模式
        base_score = 80.0

        # 检查性能问题
        performance_issues = 0
        for category, patterns in self.performance_patterns.items():
            for pattern_info in patterns:
                matches = re.findall(pattern_info["pattern"], code, re.IGNORECASE)
                performance_issues += len(matches)

        # 每个性能问题扣5分
        penalty = performance_issues * 5
        performance_score = base_score - penalty

        return max(0, min(performance_score, 100))

    def _calculate_security_score(self, code: str, language: str) -> float:
        """计算安全评分"""
        base_score = 90.0

        # 检查安全问题
        security_issues = 0
        for category, patterns in self.security_patterns.items():
            for pattern_info in patterns:
                matches = re.findall(pattern_info["pattern"], code, re.IGNORECASE)
                if pattern_info["severity"] == "high":
                    security_issues += len(matches) * 2  # 高危问题权重更大
                else:
                    security_issues += len(matches)

        # 每个安全问题扣10分
        penalty = security_issues * 10
        security_score = base_score - penalty

        return max(0, min(security_score, 100))

    def _calculate_overall_score(self, issues: List[QualityIssue], metrics: QualityMetrics) -> float:
        """计算总体评分"""
        # 基于指标的加权平均
        weights = {
            "complexity": 0.2,
            "maintainability": 0.3,
            "performance": 0.25,
            "security": 0.25
        }

        weighted_score = (
            weights["complexity"] * max(0, 100 - metrics.complexity_score * 5) +
            weights["maintainability"] * metrics.maintainability +
            weights["performance"] * metrics.performance_score +
            weights["security"] * metrics.security_score
        )

        # 根据问题数量进行额外扣分
        high_severity_issues = len([issue for issue in issues if issue.severity == "high"])
        medium_severity_issues = len([issue for issue in issues if issue.severity == "medium"])

        penalty = high_severity_issues * 10 + medium_severity_issues * 5
        final_score = weighted_score - penalty

        return max(0, min(final_score, 100))

    def _generate_quality_suggestions(self, issues: List[QualityIssue], metrics: QualityMetrics) -> List[str]:
        """生成质量改进建议"""
        suggestions = []

        # 基于指标生成建议
        if metrics.complexity_score > 15:
            suggestions.append("代码复杂度较高，建议将复杂函数拆分为多个小函数")

        if metrics.maintainability < 60:
            suggestions.append("代码可维护性较差，建议增加注释并优化代码结构")

        if metrics.performance_score < 70:
            suggestions.append("存在性能问题，建议优化算法和数据结构")

        if metrics.security_score < 80:
            suggestions.append("存在安全风险，建议修复安全漏洞并加强输入验证")

        # 基于问题类型生成建议
        issue_types = set(issue.type for issue in issues)

        if "syntax" in issue_types:
            suggestions.append("修复所有语法错误")

        if "style" in issue_types:
            suggestions.append("统一代码风格，遵循语言规范")

        if "security" in issue_types:
            suggestions.append("修复安全漏洞，加强安全防护")

        if "performance" in issue_types:
            suggestions.append("优化性能瓶颈，提升运行效率")

        return suggestions

    async def analyze_complexity(
        self,
        code: str,
        language: str,
        options: Dict[str, Any] = None
    ) -> ComplexityAnalysisResult:
        """分析代码复杂度"""
        complexity_metrics = {
            "cyclomatic": self._calculate_cyclomatic_complexity(code, language),
            "cognitive": self._calculate_cognitive_complexity(code, language),
            "nesting_depth": self._calculate_nesting_depth(code),
            "function_length": self._calculate_average_function_length(code, language)
        }

        hotspots = self._identify_complexity_hotspots(code, language)
        recommendations = self._generate_complexity_recommendations(complexity_metrics, hotspots)

        return ComplexityAnalysisResult(
            complexity_metrics=complexity_metrics,
            hotspots=hotspots,
            recommendations=recommendations
        )

    def _calculate_cognitive_complexity(self, code: str, language: str) -> float:
        """计算认知复杂度"""
        # 简化的认知复杂度计算
        nesting_penalty = 0
        lines = code.split('\n')

        for line in lines:
            indent_level = (len(line) - len(line.lstrip())) // 4  # 假设4空格缩进
            if any(keyword in line for keyword in ['if', 'for', 'while', 'try']):
                nesting_penalty += indent_level + 1

        return float(nesting_penalty)

    def _calculate_nesting_depth(self, code: str) -> float:
        """计算嵌套深度"""
        max_depth = 0
        current_depth = 0

        for line in code.split('\n'):
            stripped = line.strip()
            if stripped:
                indent = (len(line) - len(line.lstrip())) // 4
                current_depth = indent
                max_depth = max(max_depth, current_depth)

        return float(max_depth)

    def _calculate_average_function_length(self, code: str, language: str) -> float:
        """计算平均函数长度"""
        if language.lower() != "python":
            return 20.0  # 默认值

        functions = re.findall(r'def\s+\w+.*?(?=def|\Z)', code, re.DOTALL)
        if not functions:
            return 0.0

        total_lines = sum(len(func.split('\n')) for func in functions)
        return total_lines / len(functions)

    def _identify_complexity_hotspots(self, code: str, language: str) -> List[Dict[str, Any]]:
        """识别复杂度热点"""
        hotspots = []

        if language.lower() == "python":
            # 查找复杂函数
            function_pattern = r'def\s+(\w+).*?(?=def|\Z)'
            functions = re.finditer(function_pattern, code, re.DOTALL)

            for match in functions:
                func_code = match.group(0)
                func_name = match.group(1)
                complexity = self._calculate_cyclomatic_complexity(func_code, language)

                if complexity > 10:
                    hotspots.append({
                        "type": "function",
                        "name": func_name,
                        "complexity": complexity,
                        "line_start": code[:match.start()].count('\n') + 1,
                        "suggestion": "考虑将此函数拆分为多个小函数"
                    })

        return hotspots

    def _generate_complexity_recommendations(
        self,
        metrics: Dict[str, float],
        hotspots: List[Dict[str, Any]]
    ) -> List[str]:
        """生成复杂度优化建议"""
        recommendations = []

        if metrics["cyclomatic"] > 15:
            recommendations.append("圈复杂度过高，建议重构复杂逻辑")

        if metrics["cognitive"] > 20:
            recommendations.append("认知复杂度过高，建议简化控制流程")

        if metrics["nesting_depth"] > 4:
            recommendations.append("嵌套层次过深，建议提取函数或使用早期返回")

        if metrics["function_length"] > 50:
            recommendations.append("函数平均长度过长，建议拆分大函数")

        if hotspots:
            recommendations.append(f"发现 {len(hotspots)} 个复杂度热点，建议优先重构")

        return recommendations

    async def security_scan(
        self,
        code: str,
        language: str,
        scan_types: List[str] = None
    ) -> SecurityScanResult:
        """安全漏洞扫描"""
        scan_types = scan_types or ["all"]
        security_issues = []
        severity_counts = {"high": 0, "medium": 0, "low": 0}

        patterns_to_check = self.security_patterns
        if "all" not in scan_types:
            patterns_to_check = {k: v for k, v in self.security_patterns.items() if k in scan_types}

        for category, patterns in patterns_to_check.items():
            for pattern_info in patterns:
                matches = re.finditer(pattern_info["pattern"], code, re.IGNORECASE | re.MULTILINE)
                for match in matches:
                    line_num = code[:match.start()].count('\n') + 1
                    severity = pattern_info["severity"]

                    security_issues.append({
                        "category": category,
                        "message": pattern_info["message"],
                        "severity": severity,
                        "line_number": line_num,
                        "matched_text": match.group(0)
                    })

                    severity_counts[severity] += 1

        # 计算总体风险
        overall_risk = self._calculate_overall_risk(severity_counts)

        recommendations = self._generate_security_recommendations(security_issues)

        return SecurityScanResult(
            security_issues=security_issues,
            severity_counts=severity_counts,
            recommendations=recommendations,
            overall_risk=overall_risk
        )

    def _calculate_overall_risk(self, severity_counts: Dict[str, int]) -> str:
        """计算总体风险级别"""
        if severity_counts["high"] > 0:
            return "high"
        elif severity_counts["medium"] > 2:
            return "high"
        elif severity_counts["medium"] > 0:
            return "medium"
        elif severity_counts["low"] > 5:
            return "medium"
        else:
            return "low"

    def _generate_security_recommendations(self, issues: List[Dict[str, Any]]) -> List[str]:
        """生成安全建议"""
        recommendations = []
        categories = set(issue["category"] for issue in issues)

        if "sql_injection" in categories:
            recommendations.append("使用参数化查询或ORM防止SQL注入")

        if "xss" in categories:
            recommendations.append("对用户输入进行适当的转义和验证")

        if "hardcoded_secrets" in categories:
            recommendations.append("将敏感信息移至环境变量或配置文件")

        if "path_traversal" in categories:
            recommendations.append("验证和规范化文件路径，限制访问范围")

        if not recommendations:
            recommendations.append("继续保持良好的安全编码习惯")

        return recommendations

    async def optimize_code(
        self,
        code: str,
        language: str,
        optimization_types: List[str] = None
    ) -> OptimizationResult:
        """代码优化建议"""
        optimization_types = optimization_types or ["performance", "readability"]
        optimizations = []

        if "performance" in optimization_types:
            perf_opts = self._analyze_performance_optimizations(code, language)
            optimizations.extend(perf_opts)

        if "readability" in optimization_types:
            read_opts = self._analyze_readability_optimizations(code, language)
            optimizations.extend(read_opts)

        if "memory" in optimization_types:
            mem_opts = self._analyze_memory_optimizations(code, language)
            optimizations.extend(mem_opts)

        estimated_improvements = self._estimate_improvements(optimizations)
        priority_order = self._prioritize_optimizations(optimizations)

        return OptimizationResult(
            optimizations=optimizations,
            estimated_improvements=estimated_improvements,
            priority_order=priority_order
        )

    def _analyze_performance_optimizations(self, code: str, language: str) -> List[Dict[str, Any]]:
        """分析性能优化点"""
        optimizations = []

        for category, patterns in self.performance_patterns.items():
            for pattern_info in patterns:
                matches = re.finditer(pattern_info["pattern"], code, re.IGNORECASE | re.MULTILINE)
                for match in matches:
                    line_num = code[:match.start()].count('\n') + 1
                    optimizations.append({
                        "type": "performance",
                        "category": category,
                        "description": pattern_info["message"],
                        "suggestion": pattern_info.get("optimization", "性能优化"),
                        "line_number": line_num,
                        "impact": "medium"
                    })

        return optimizations

    def _analyze_readability_optimizations(self, code: str, language: str) -> List[Dict[str, Any]]:
        """分析可读性优化点"""
        optimizations = []

        lines = code.split('\n')
        for line_num, line in enumerate(lines, 1):
            # 检查长行
            if len(line) > 100:
                optimizations.append({
                    "type": "readability",
                    "category": "long_line",
                    "description": "行长度过长，影响可读性",
                    "suggestion": "将长行拆分为多行",
                    "line_number": line_num,
                    "impact": "low"
                })

            # 检查复杂表达式
            if line.count('(') > 3 or line.count('[') > 2:
                optimizations.append({
                    "type": "readability",
                    "category": "complex_expression",
                    "description": "表达式过于复杂",
                    "suggestion": "将复杂表达式拆分为多个简单的语句",
                    "line_number": line_num,
                    "impact": "medium"
                })

        return optimizations

    def _analyze_memory_optimizations(self, code: str, language: str) -> List[Dict[str, Any]]:
        """分析内存优化点"""
        optimizations = []

        # 检查可能的内存问题
        if language.lower() == "python":
            # 查找大列表推导式
            list_comprehensions = re.finditer(r'\[.*for.*in.*\]', code)
            for match in list_comprehensions:
                line_num = code[:match.start()].count('\n') + 1
                optimizations.append({
                    "type": "memory",
                    "category": "large_list_comprehension",
                    "description": "大列表推导式可能消耗大量内存",
                    "suggestion": "考虑使用生成器表达式",
                    "line_number": line_num,
                    "impact": "medium"
                })

        return optimizations

    def _estimate_improvements(self, optimizations: List[Dict[str, Any]]) -> Dict[str, str]:
        """估算优化效果"""
        improvements = {}

        perf_opts = [opt for opt in optimizations if opt["type"] == "performance"]
        read_opts = [opt for opt in optimizations if opt["type"] == "readability"]
        mem_opts = [opt for opt in optimizations if opt["type"] == "memory"]

        if perf_opts:
            improvements["performance"] = f"预计性能提升 {len(perf_opts) * 10}%-{len(perf_opts) * 20}%"

        if read_opts:
            improvements["readability"] = f"代码可读性显著提升，减少 {len(read_opts)} 个可读性问题"

        if mem_opts:
            improvements["memory"] = f"预计内存使用优化 {len(mem_opts) * 15}%-{len(mem_opts) * 25}%"

        return improvements

    def _prioritize_optimizations(self, optimizations: List[Dict[str, Any]]) -> List[str]:
        """优化建议优先级排序"""
        # 按影响程度和类型排序
        priority_map = {"high": 3, "medium": 2, "low": 1}
        type_priority = {"performance": 3, "memory": 2, "readability": 1}

        def get_priority_score(opt):
            impact_score = priority_map.get(opt["impact"], 1)
            type_score = type_priority.get(opt["type"], 1)
            return impact_score * type_score

        sorted_opts = sorted(optimizations, key=get_priority_score, reverse=True)

        return [f"Line {opt['line_number']}: {opt['suggestion']}" for opt in sorted_opts[:10]]  # 返回前10个