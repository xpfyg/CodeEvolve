import React, { useState } from 'react';
import { TestGenerationRequest } from '../types/index';

interface TestGenerationFormProps {
  onSubmit: (data: TestGenerationRequest) => Promise<void>;
  loading?: boolean;
}

const TestGenerationForm: React.FC<TestGenerationFormProps> = ({ onSubmit, loading = false }) => {
  const [repoPath, setRepoPath] = useState('');
  const [filePath, setFilePath] = useState('');
  const [testFilePath, setTestFilePath] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoPath.trim() || !filePath.trim()) {
      alert('请填写仓库路径和源文件路径');
      return;
    }

    try {
      const data: TestGenerationRequest = {
        repo_path: repoPath.trim(),
        file_path: filePath.trim(),
        test_file_path: testFilePath.trim() || undefined,
      };

      await onSubmit(data);
    } catch (error) {
      console.error('Failed to generate tests:', error);
      alert('测试生成失败，请重试');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">自动生成测试</h2>
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
            源文件路径 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="filePath"
            value={filePath}
            onChange={(e) => setFilePath(e.target.value)}
            placeholder="src/utils.py"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">要生成测试的源文件路径</p>
        </div>

        <div>
          <label htmlFor="testFilePath" className="block text-sm font-medium text-gray-700 mb-2">
            测试文件路径 (可选)
          </label>
          <input
            type="text"
            id="testFilePath"
            value={testFilePath}
            onChange={(e) => setTestFilePath(e.target.value)}
            placeholder="tests/test_utils.py"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">留空则自动生成测试文件路径</p>
        </div>

        <button
          type="submit"
          disabled={loading || !repoPath.trim() || !filePath.trim()}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '生成中...' : '生成测试'}
        </button>
      </form>
    </div>
  );
};

export default TestGenerationForm;