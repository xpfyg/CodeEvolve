import React, { useState } from 'react';
import { CodeAnalysisRequest } from '../types/index';

interface CodeAnalysisFormProps {
  onSubmit: (data: CodeAnalysisRequest) => Promise<void>;
  loading?: boolean;
}

const CodeAnalysisForm: React.FC<CodeAnalysisFormProps> = ({ onSubmit, loading = false }) => {
  const [repoPath, setRepoPath] = useState('');
  const [filePath, setFilePath] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoPath.trim() || !filePath.trim()) {
      alert('请填写仓库路径和文件路径');
      return;
    }

    try {
      const data: CodeAnalysisRequest = {
        repo_path: repoPath.trim(),
        file_path: filePath.trim(),
      };

      await onSubmit(data);
    } catch (error) {
      console.error('Failed to analyze code:', error);
      alert('代码分析失败，请重试');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">代码质量分析</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="repoPath" className="block text-sm font-medium text-gray-700 mb-2">
            仓库路径 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="repoPath"
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
            placeholder="/path/to/project"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="filePath" className="block text-sm font-medium text-gray-700 mb-2">
            文件路径 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="filePath"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="src/main.py"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">要分析的源文件相对路径</p>
        </div>

        <button
          type="submit"
          disabled={loading || !repoPath.trim() || !filePath.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '分析中...' : '开始分析'}
        </button>
      </form>
    </div>
  );
};

export default CodeAnalysisForm;