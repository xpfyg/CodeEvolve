import React, { useState, useEffect } from 'react';
import { useAppStore, Issue } from '../store';
import { IssueResponse } from '../api';
import apiService from '../api';
import IssueCard from './IssueCard';

const IssueList: React.FC = () => {
  const {
    repoPath,
    issues,
    isLoadingIssues,
    addIssue,
    setIssues,
    setLoadingIssues
  } = useAppStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [newIssueDescription, setNewIssueDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Load issues when component mounts or repo path changes
  useEffect(() => {
    const loadIssues = async () => {
      if (!repoPath) return;

      setLoadingIssues(true);
      try {
        const issueResponses = await apiService.getRepositoryIssues();
        // Convert API response to our Issue type
        const convertedIssues: Issue[] = issueResponses.map(issue => ({
          id: issue.id,
          title: issue.title,
          description: issue.description,
          status: issue.status,
          branch_name: issue.branch_name,
          created_at: issue.created_at,
          updated_at: issue.updated_at,
        }));
        setIssues(convertedIssues);
      } catch (error) {
        console.error('Failed to load issues:', error);
      } finally {
        setLoadingIssues(false);
      }
    };

    if (repoPath) {
      loadIssues();
    }
  }, [repoPath, setLoadingIssues, setIssues]);

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newIssueTitle.trim() || !newIssueDescription.trim() || !repoPath) {
      return;
    }

    setIsCreating(true);
    try {
      const response: IssueResponse = await apiService.createRepositoryIssue({
        title: newIssueTitle.trim(),
        description: newIssueDescription.trim(),
        repoPath: repoPath,
      });

      // Convert API response to our Issue type
      const newIssue: Issue = {
        id: response.id,
        title: response.title,
        description: response.description,
        status: response.status,
        created_at: response.created_at,
      };

      addIssue(newIssue);
      setNewIssueTitle('');
      setNewIssueDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create issue:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewIssueTitle('');
    setNewIssueDescription('');
  };

  if (isLoadingIssues) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600 font-medium">加载 Issue 列表中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-900">
            项目需求管理
          </h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {issues.length} 个需求
          </span>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
        >
          <span className="mr-2">➕</span>
          新建 Issue
        </button>
      </div>

      {/* Create Issue Form */}
      {showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">✨</span>
            创建新需求
          </h3>

          <form onSubmit={handleCreateIssue} className="space-y-4">
            <div>
              <label htmlFor="issueTitle" className="block text-sm font-medium text-gray-700 mb-2">
                需求标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="issueTitle"
                value={newIssueTitle}
                onChange={(e) => setNewIssueTitle(e.target.value)}
                placeholder="请输入需求标题，例如：实现用户认证功能"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isCreating}
                required
              />
            </div>

            <div>
              <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700 mb-2">
                需求描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="issueDescription"
                value={newIssueDescription}
                onChange={(e) => setNewIssueDescription(e.target.value)}
                placeholder="请详细描述功能需求，例如：添加登录、注册和权限验证功能，包括JWT令牌管理"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                disabled={isCreating}
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelCreate}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
                disabled={isCreating}
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isCreating || !newIssueTitle.trim() || !newIssueDescription.trim()}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isCreating ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    创建中...
                  </div>
                ) : (
                  '创建 Issue'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Issues List */}
      {issues.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无 Issue</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              还没有创建任何需求。点击上方按钮创建您的第一个 Issue，开始您的开发之旅！
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
            >
              <span className="mr-2">🚀</span>
              创建第一个 Issue
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
};

export default IssueList;