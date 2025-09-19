import React, { useState } from 'react';
import { useAppStore } from '../store';
import apiService from '../api';

const RepoLoader: React.FC = () => {
  const [inputPath, setInputPath] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setRepoPath, setRepoValid } = useAppStore();

  const handleSelectDirectory = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        const path = files[0].webkitRelativePath.split('/')[0];
        setInputPath(path);
      }
    };
    input.click();
  };

  const validateRepository = async () => {
    if (!inputPath.trim()) {
      setError('请输入项目路径');
      return;
    }

    setIsValidating(true);
    setError(null);

    try {
      // Check if the path is a valid Git repository
      const response = await apiService.checkRepository(inputPath.trim());

      if (response.valid) {
        setRepoPath(inputPath.trim());
        setRepoValid(true);
        setError(null);
      } else {
        setError('该路径不是有效的 Git 仓库，请检查路径是否正确');
      }
    } catch (err: unknown) {
      console.error('Repository validation failed:', err);
      const errorMessage = err instanceof Error ? err.message : '仓库验证失败，请检查路径是否正确';
      setError(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateRepository();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            <h1 className="text-4xl font-bold mb-2">
              CodeEvolve AI
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            请选择您的项目路径开始
          </p>
        </div>

        {/* Repo Selection Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">📁</span>
            <h2 className="text-xl font-semibold text-gray-800">选择项目仓库</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="repoPath" className="block text-sm font-medium text-gray-700 mb-2">
                项目路径 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="repoPath"
                  value={inputPath}
                  onChange={(e) => setInputPath(e.target.value)}
                  placeholder="/path/to/your/git/repository"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isValidating}
                />
                <button
                  type="button"
                  onClick={handleSelectDirectory}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
                  disabled={isValidating}
                >
                  浏览
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                请输入 Git 仓库的本地路径，或点击浏览选择文件夹
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-500 text-xl mr-2">⚠️</span>
                  <span className="text-red-700 font-medium">{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isValidating || !inputPath.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {isValidating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  验证仓库中...
                </div>
              ) : (
                '确认并开始'
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">💡 使用提示</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 确保路径指向一个有效的 Git 仓库</li>
              <li>• 建议使用绝对路径以避免路径错误</li>
              <li>• 仓库应该已经初始化并有至少一次提交</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepoLoader;