#!/usr/bin/env python3
"""
AI 代码生成服务测试脚本

使用示例:
python test_service.py --repo-path /path/to/repo --requirement "添加用户认证功能"
"""

import requests
import argparse
import json
import sys
import os

def test_health_check(base_url):
    """测试健康检查接口"""
    print("🔍 测试健康检查...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            print("✅ 服务健康检查通过")
            print(f"   响应: {response.json()}")
            return True
        else:
            print(f"❌ 健康检查失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 连接失败: {str(e)}")
        return False

def test_generate_code(base_url, repo_path, requirement, branch_name=None):
    """测试代码生成接口"""
    print(f"🤖 测试代码生成...")
    print(f"   需求: {requirement}")
    print(f"   仓库: {repo_path}")

    data = {
        "requirement": requirement,
        "repo_path": repo_path,
        "target_files": [],
    }

    if branch_name:
        data["branch_name"] = branch_name

    try:
        response = requests.post(f"{base_url}/generate-code", json=data)

        if response.status_code == 200:
            result = response.json()
            print("✅ 代码生成成功")
            print(f"   分支: {result['branch_name']}")
            print(f"   提交: {result.get('commit_hash', 'N/A')}")
            print(f"   修改文件: {result.get('modified_files', [])}")
            return True
        else:
            print(f"❌ 代码生成失败: {response.status_code}")
            print(f"   错误: {response.text}")
            return False

    except Exception as e:
        print(f"❌ 请求失败: {str(e)}")
        return False

def test_list_branches(base_url, repo_path):
    """测试分支列表接口"""
    print("📁 测试分支列表...")

    try:
        # URL 编码路径
        encoded_path = repo_path.replace('/', '%2F')
        response = requests.get(f"{base_url}/repos/{encoded_path}/branches")

        if response.status_code == 200:
            result = response.json()
            print("✅ 分支列表获取成功")
            print(f"   分支数量: {len(result['branches'])}")
            for branch in result['branches'][:5]:  # 只显示前5个
                print(f"   - {branch}")
            return True
        else:
            print(f"❌ 分支列表获取失败: {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ 请求失败: {str(e)}")
        return False

def test_analyze_code(base_url, repo_path, file_path):
    """测试代码分析接口"""
    print(f"🔍 测试代码分析...")
    print(f"   文件: {file_path}")

    data = {
        "repo_path": repo_path,
        "file_path": file_path
    }

    try:
        response = requests.post(f"{base_url}/api/v1/analyze-code", json=data)

        if response.status_code == 200:
            result = response.json()
            print("✅ 代码分析成功")
            print(f"   分析结果: {result.get('analysis', {}).get('analysis', 'N/A')[:100]}...")
            return True
        else:
            print(f"❌ 代码分析失败: {response.status_code}")
            print(f"   错误: {response.text}")
            return False

    except Exception as e:
        print(f"❌ 请求失败: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='AI 代码生成服务测试')
    parser.add_argument('--url', default='http://localhost:8000', help='服务 URL')
    parser.add_argument('--repo-path', required=True, help='Git 仓库路径')
    parser.add_argument('--requirement', default='创建一个Hello World函数', help='代码需求描述')
    parser.add_argument('--branch-name', help='分支名称 (可选)')
    parser.add_argument('--test-file', help='用于代码分析的测试文件')

    args = parser.parse_args()

    print("🚀 开始测试 AI 代码生成服务")
    print(f"服务地址: {args.url}")
    print("-" * 50)

    # 检查仓库路径
    if not os.path.exists(args.repo_path):
        print(f"❌ 仓库路径不存在: {args.repo_path}")
        sys.exit(1)

    success_count = 0
    total_tests = 0

    # 测试健康检查
    total_tests += 1
    if test_health_check(args.url):
        success_count += 1
    print()

    # 测试分支列表
    total_tests += 1
    if test_list_branches(args.url, args.repo_path):
        success_count += 1
    print()

    # 测试代码生成
    total_tests += 1
    if test_generate_code(args.url, args.repo_path, args.requirement, args.branch_name):
        success_count += 1
    print()

    # 测试代码分析 (如果提供了测试文件)
    if args.test_file:
        total_tests += 1
        if test_analyze_code(args.url, args.repo_path, args.test_file):
            success_count += 1
        print()

    # 输出测试结果
    print("-" * 50)
    print(f"测试完成: {success_count}/{total_tests} 通过")

    if success_count == total_tests:
        print("🎉 所有测试通过!")
        sys.exit(0)
    else:
        print("⚠️ 部分测试失败，请检查服务配置")
        sys.exit(1)

if __name__ == '__main__':
    main()