import os
import asyncio
from typing import Dict, List, Any
import logging
from anthropic import Anthropic
import openai

logger = logging.getLogger(__name__)

class AIService:
    """AI代码生成服务类"""

    def __init__(self):
        # 初始化AI客户端
        self.anthropic_client = None
        self.openai_client = None

        # 初始化Claude客户端
        anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        if anthropic_api_key:
            self.anthropic_client = Anthropic(api_key=anthropic_api_key)

        # 初始化OpenAI客户端
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if openai_api_key:
            self.openai_client = openai.OpenAI(api_key=openai_api_key)

    async def generate_code_modifications(self,
                                         requirement: str,
                                         code_context: Dict[str, Any],
                                         target_files: List[str] = None) -> Dict[str, str]:
        """
        生成代码修改

        Args:
            requirement: 需求描述
            code_context: 代码库上下文
            target_files: 目标文件列表

        Returns:
            文件路径到内容的映射
        """
        try:
            # 构建提示词
            prompt = self._build_code_generation_prompt(
                requirement, code_context, target_files
            )

            # 调用AI生成代码
            if self.anthropic_client:
                response = await self._call_anthropic(prompt)
            elif self.openai_client:
                response = await self._call_openai(prompt)
            else:
                raise Exception("未配置AI API密钥")

            # 解析AI响应
            modifications = self._parse_ai_response(response)

            logger.info(f"AI生成了 {len(modifications)} 个文件的修改")
            return modifications

        except Exception as e:
            logger.error(f"AI代码生成失败: {str(e)}")
            raise Exception(f"AI代码生成失败: {str(e)}")

    def _build_code_generation_prompt(self,
                                     requirement: str,
                                     code_context: Dict[str, Any],
                                     target_files: List[str] = None) -> str:
        """构建代码生成提示词"""

        prompt = f"""
你是一个专业的代码生成助手。请根据以下需求生成或修改代码。

## 需求描述
{requirement}

## 代码库上下文
- 项目名称: {code_context.get('repo_name', 'Unknown')}
- 当前分支: {code_context.get('current_branch', 'main')}
- 支持语言: {', '.join(code_context.get('languages', []))}
- 关键文件: {', '.join(code_context.get('key_files', []))}

## 目标文件
{target_files if target_files else '请根据需求确定需要修改的文件'}

## 要求
1. 请提供完整的文件内容，而不是代码片段
2. 确保代码符合最佳实践和项目风格
3. 包含必要的注释和文档
4. 如果是新功能，请考虑错误处理和边界情况
5. 输出格式必须严格按照以下格式：

```
FILE: 文件路径
```文件类型
文件完整内容
```

FILE: 另一个文件路径
```文件类型
另一个文件完整内容
```

## 注意事项
- 确保所有依赖都已正确导入
- 遵循项目的编码规范
- 考虑性能和安全性
- 提供清晰的变量和函数命名
"""

        return prompt

    async def _call_anthropic(self, prompt: str) -> str:
        """调用Anthropic Claude API"""
        try:
            # 注意：这是伪代码示例，实际使用时请替换为真实的API调用
            message = self.anthropic_client.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=4000,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            return message.content[0].text

        except Exception as e:
            logger.error(f"调用Anthropic API失败: {str(e)}")
            raise Exception(f"调用Anthropic API失败: {str(e)}")

    async def _call_openai(self, prompt: str) -> str:
        """调用OpenAI API"""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "你是一个专业的代码生成助手。"},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=4000,
                temperature=0.1
            )
            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"调用OpenAI API失败: {str(e)}")
            raise Exception(f"调用OpenAI API失败: {str(e)}")

    def _parse_ai_response(self, response: str) -> Dict[str, str]:
        """解析AI响应，提取文件内容"""
        modifications = {}

        try:
            lines = response.split('\n')
            current_file = None
            current_content = []
            in_code_block = False

            for line in lines:
                # 检测文件标记
                if line.startswith('FILE:'):
                    # 保存上一个文件
                    if current_file and current_content:
                        modifications[current_file] = '\n'.join(current_content)

                    # 开始新文件
                    current_file = line.replace('FILE:', '').strip()
                    current_content = []
                    in_code_block = False

                # 检测代码块
                elif line.startswith('```'):
                    in_code_block = not in_code_block
                    if not in_code_block and current_file:
                        # 代码块结束
                        continue

                # 收集文件内容
                elif in_code_block and current_file:
                    current_content.append(line)

            # 保存最后一个文件
            if current_file and current_content:
                modifications[current_file] = '\n'.join(current_content)

            # 如果解析失败，尝试简单模式
            if not modifications:
                modifications = self._parse_simple_response(response)

            return modifications

        except Exception as e:
            logger.error(f"解析AI响应失败: {str(e)}")
            # 返回默认示例
            return self._generate_default_response()

    def _parse_simple_response(self, response: str) -> Dict[str, str]:
        """简单解析模式，用于处理格式不标准的响应"""
        modifications = {}

        # 尝试提取代码块
        code_blocks = []
        lines = response.split('\n')

        current_block = []
        in_block = False

        for line in lines:
            if line.strip().startswith('```'):
                if in_block:
                    # 代码块结束
                    code_blocks.append('\n'.join(current_block))
                    current_block = []
                in_block = not in_block
            elif in_block:
                current_block.append(line)

        # 如果只有一个代码块，假设是主要文件
        if len(code_blocks) == 1:
            modifications['src/generated_code.py'] = code_blocks[0]

        return modifications

    def _generate_default_response(self) -> Dict[str, str]:
        """生成默认响应，用于API调用失败时的降级处理"""
        return {
            'src/example.py': '''# AI生成的示例代码
# 请替换为实际的API密钥配置

def hello_world():
    """示例函数"""
    print("Hello, World! This is AI generated code.")

if __name__ == "__main__":
    hello_world()
'''
        }

    async def analyze_code_quality(self, file_content: str, file_type: str) -> Dict[str, Any]:
        """
        分析代码质量

        Args:
            file_content: 文件内容
            file_type: 文件类型

        Returns:
            代码质量分析结果
        """
        try:
            prompt = f"""
请分析以下{file_type}代码的质量，包括：
1. 代码风格和规范
2. 潜在的bug或问题
3. 性能优化建议
4. 安全性问题
5. 可维护性评估

代码内容：
```{file_type}
{file_content}
```

请以JSON格式返回分析结果。
"""

            if self.anthropic_client:
                response = await self._call_anthropic(prompt)
            elif self.openai_client:
                response = await self._call_openai(prompt)
            else:
                return {"error": "未配置AI API密钥"}

            # 这里应该解析JSON响应，简化起见返回文本
            return {"analysis": response}

        except Exception as e:
            logger.error(f"代码质量分析失败: {str(e)}")
            return {"error": str(e)}

    async def generate_tests(self, code_content: str, file_type: str) -> str:
        """
        为代码生成测试

        Args:
            code_content: 代码内容
            file_type: 文件类型

        Returns:
            测试代码
        """
        try:
            prompt = f"""
请为以下{file_type}代码生成完整的单元测试：

```{file_type}
{code_content}
```

要求：
1. 覆盖主要函数和方法
2. 包含边界情况测试
3. 使用适当的测试框架
4. 提供清晰的测试描述
"""

            if self.anthropic_client:
                response = await self._call_anthropic(prompt)
            elif self.openai_client:
                response = await self._call_openai(prompt)
            else:
                return "# 测试生成失败：未配置AI API密钥"

            return response

        except Exception as e:
            logger.error(f"测试生成失败: {str(e)}")
            return f"# 测试生成失败：{str(e)}"