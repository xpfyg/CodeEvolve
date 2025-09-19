import React, { useState } from 'react';
import { CodeModificationRequest } from '../types/index';

interface CodeGenerationFormProps {
  onSubmit: (data: CodeModificationRequest) => Promise<void>;
  loading?: boolean;
}

const CodeGenerationForm: React.FC<CodeGenerationFormProps> = ({ onSubmit, loading = false }) => {
  const [requirement, setRequirement] = useState('');
  const [repoPath, setRepoPath] = useState('');
  const [targetFiles, setTargetFiles] = useState('');
  const [branchName, setBranchName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requirement.trim() || !repoPath.trim()) {
      alert('请填写需求描述和仓库路径');
      return;
    }

    try {
      const data: CodeModificationRequest = {
        requirement: requirement.trim(),
        repo_path: repoPath.trim(),
        target_files: targetFiles.trim() ? targetFiles.split(',').map(f => f.trim()) : undefined,
        branch_name: branchName.trim() || undefined,
      };

      await onSubmit(data);
      setRequirement('');
      setRepoPath('');
      setTargetFiles('');
      setBranchName('');
    } catch (error) {
      console.error('Failed to generate code:', error);
      alert('代码生成失败，请重试');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">AI 代码生成</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="requirement" className="block text-sm font-medium text-gray-700 mb-2">
            需求描述 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="requirement"
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="请详细描述您要实现的功能，例如：添加用户认证功能，包括登录和注册接口"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="repoPath" className="block text-sm font-medium text-gray-700 mb-2">
            仓库路径 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="repoPath"
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
            placeholder="/path/to/your/project"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="targetFiles" className="block text-sm font-medium text-gray-700 mb-2">
            目标文件 (可选)
          </label>
          <input
            type="text"
            id="targetFiles"
            value={targetFiles}
            onChange={(e) => setTargetFiles(e.target.value)}
            placeholder="src/auth.py, src/models/user.py (用逗号分隔)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">指定要修改的文件列表，留空则由 AI 自动判断</p>
        </div>

        <div>
          <label htmlFor="branchName" className="block text-sm font-medium text-gray-700 mb-2">
            分支名称 (可选)
          </label>
          <input
            type="text"
            id="branchName"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            placeholder="feature-user-auth"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">留空则自动生成分支名称</p>
        </div>

        <button
          type="submit"
          disabled={loading || !requirement.trim() || !repoPath.trim()}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '生成中...' : '开始生成代码'}
        </button>
      </form>
    </div>
  );
};

export default CodeGenerationForm;