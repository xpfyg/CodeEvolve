import git
import os
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

class GitService:
    """Git操作服务类"""

    def __init__(self):
        pass

    def create_branch(self, repo_path: str, branch_name: str) -> str:
        """
        创建新分支

        Args:
            repo_path: 仓库路径
            branch_name: 分支名称

        Returns:
            创建的分支名称
        """
        try:
            repo = git.Repo(repo_path)

            # 确保在main分支
            repo.git.checkout('main')
            repo.git.pull('origin', 'main')

            # 创建并切换到新分支
            new_branch = repo.create_head(branch_name)
            new_branch.checkout()

            logger.info(f"成功创建并切换到分支: {branch_name}")
            return branch_name

        except Exception as e:
            logger.error(f"创建分支失败: {str(e)}")
            raise Exception(f"创建分支失败: {str(e)}")

    def commit_and_push(self, repo_path: str, branch_name: str,
                       commit_message: str, modified_files: List[str]) -> str:
        """
        提交更改并推送到远程仓库

        Args:
            repo_path: 仓库路径
            branch_name: 分支名称
            commit_message: 提交信息
            modified_files: 修改的文件列表

        Returns:
            提交的哈希值
        """
        try:
            repo = git.Repo(repo_path)

            # 添加修改的文件
            for file_path in modified_files:
                repo.index.add([file_path])

            # 提交更改
            commit = repo.index.commit(commit_message)
            commit_hash = commit.hexsha

            # 推送到远程仓库
            origin = repo.remote('origin')
            origin.push(branch_name)

            logger.info(f"成功提交并推送，提交哈希: {commit_hash}")
            return commit_hash

        except Exception as e:
            logger.error(f"提交推送失败: {str(e)}")
            raise Exception(f"提交推送失败: {str(e)}")

    def list_branches(self, repo_path: str) -> List[str]:
        """
        列出所有分支

        Args:
            repo_path: 仓库路径

        Returns:
            分支列表
        """
        try:
            repo = git.Repo(repo_path)
            branches = [str(branch) for branch in repo.heads]
            return branches

        except Exception as e:
            logger.error(f"获取分支列表失败: {str(e)}")
            raise Exception(f"获取分支列表失败: {str(e)}")

    def list_files(self, repo_path: str, extension: str = None) -> List[str]:
        """
        列出仓库中的文件

        Args:
            repo_path: 仓库路径
            extension: 文件扩展名过滤器

        Returns:
            文件列表
        """
        try:
            files = []
            for root, dirs, filenames in os.walk(repo_path):
                # 跳过.git目录
                if '.git' in dirs:
                    dirs.remove('.git')

                for filename in filenames:
                    if extension is None or filename.endswith(extension):
                        rel_path = os.path.relpath(
                            os.path.join(root, filename), repo_path
                        )
                        files.append(rel_path)

            return files

        except Exception as e:
            logger.error(f"获取文件列表失败: {str(e)}")
            raise Exception(f"获取文件列表失败: {str(e)}")

    def analyze_codebase(self, repo_path: str) -> Dict[str, Any]:
        """
        分析代码库结构

        Args:
            repo_path: 仓库路径

        Returns:
            代码库分析结果
        """
        try:
            repo = git.Repo(repo_path)

            # 获取基本信息
            analysis = {
                "repo_name": os.path.basename(repo_path),
                "current_branch": str(repo.active_branch),
                "total_commits": len(list(repo.iter_commits())),
                "file_structure": {},
                "languages": set(),
                "key_files": []
            }

            # 分析文件结构和语言
            for root, dirs, files in os.walk(repo_path):
                if '.git' in dirs:
                    dirs.remove('.git')

                for file in files:
                    full_path = os.path.join(root, file)
                    rel_path = os.path.relpath(full_path, repo_path)

                    # 获取文件扩展名
                    _, ext = os.path.splitext(file)
                    if ext:
                        analysis["languages"].add(ext)

                    # 标记关键文件
                    if file in ['package.json', 'go.mod', 'requirements.txt',
                              'Dockerfile', 'README.md', '.gitignore']:
                        analysis["key_files"].append(rel_path)

            analysis["languages"] = list(analysis["languages"])

            return analysis

        except Exception as e:
            logger.error(f"代码库分析失败: {str(e)}")
            raise Exception(f"代码库分析失败: {str(e)}")

    def get_file_content(self, repo_path: str, file_path: str) -> str:
        """
        获取文件内容

        Args:
            repo_path: 仓库路径
            file_path: 文件相对路径

        Returns:
            文件内容
        """
        try:
            full_path = os.path.join(repo_path, file_path)
            with open(full_path, 'r', encoding='utf-8') as f:
                return f.read()

        except Exception as e:
            logger.error(f"读取文件失败: {str(e)}")
            raise Exception(f"读取文件失败: {str(e)}")

    def create_pull_request_info(self, repo_path: str, branch_name: str,
                                requirement: str) -> Dict[str, str]:
        """
        生成PR信息

        Args:
            repo_path: 仓库路径
            branch_name: 分支名称
            requirement: 需求描述

        Returns:
            PR信息字典
        """
        try:
            repo = git.Repo(repo_path)

            # 获取最新提交信息
            latest_commit = repo.head.commit

            pr_info = {
                "title": f"AI生成: {requirement}",
                "body": f"""
## 需求描述
{requirement}

## 变更内容
- 由AI自动生成的代码修改
- 分支: `{branch_name}`
- 提交: `{latest_commit.hexsha[:8]}`

## 测试
请确保运行相关测试验证功能正常。

---
*此PR由AI自动生成*
                """.strip(),
                "head": branch_name,
                "base": "main"
            }

            return pr_info

        except Exception as e:
            logger.error(f"生成PR信息失败: {str(e)}")
            raise Exception(f"生成PR信息失败: {str(e)}")