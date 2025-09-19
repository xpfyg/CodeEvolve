import React, { useState } from 'react';
import { Issue } from '../types/index';

interface IssueCardProps {
  issue: Issue;
  onCreateBranch: (id: number) => Promise<void>;
  onCreatePR: (id: number) => Promise<void>;
  onMergePR: (id: number) => Promise<void>;
  onGetPreview: (id: number) => Promise<void>;
}

const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onCreateBranch,
  onCreatePR,
  onMergePR,
  onGetPreview,
}) => {
  const [loading, setLoading] = useState<{
    branch: boolean;
    pr: boolean;
    merge: boolean;
    preview: boolean;
  }>({
    branch: false,
    pr: false,
    merge: false,
    preview: false,
  });

  const handleAction = async (
    action: () => Promise<void>,
    type: 'branch' | 'pr' | 'merge' | 'preview'
  ) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      await action();
    } catch (error) {
      console.error(`Failed to ${type}:`, error);
      alert(`操作失败，请重试`);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPRStatusColor = (prStatus?: string) => {
    if (!prStatus) return 'bg-gray-100 text-gray-800';
    switch (prStatus.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'merged':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500">#{issue.id}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
              {issue.status}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{issue.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{issue.description}</p>
        </div>
      </div>

      {/* Branch 和 PR 信息 */}
      <div className="mb-4 space-y-2">
        {issue.branch_name && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">分支:</span>
            <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
              {issue.branch_name}
            </span>
          </div>
        )}

        {issue.pr_status && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">PR状态:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPRStatusColor(issue.pr_status)}`}>
              {issue.pr_status}
            </span>
          </div>
        )}

        {issue.preview_url && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">预览:</span>
            <a
              href={issue.preview_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              查看预览
            </a>
          </div>
        )}

        {issue.pr_url && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">PR链接:</span>
            <a
              href={issue.pr_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              查看PR
            </a>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleAction(() => onCreateBranch(issue.id), 'branch')}
          disabled={loading.branch || !!issue.branch_name}
          className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading.branch ? '创建中...' : issue.branch_name ? '已创建分支' : '创建分支'}
        </button>

        <button
          onClick={() => handleAction(() => onGetPreview(issue.id), 'preview')}
          disabled={loading.preview}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading.preview ? '获取中...' : '预览'}
        </button>

        <button
          onClick={() => handleAction(() => onCreatePR(issue.id), 'pr')}
          disabled={loading.pr || !issue.branch_name || issue.pr_status === 'merged'}
          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading.pr ? '提交中...' : issue.pr_status ? '已提交PR' : '提交PR'}
        </button>

        <button
          onClick={() => handleAction(() => onMergePR(issue.id), 'merge')}
          disabled={
            loading.merge ||
            !issue.pr_status ||
            issue.pr_status === 'merged' ||
            issue.pr_status === 'closed'
          }
          className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading.merge ? '合并中...' : issue.pr_status === 'merged' ? '已合并' : '合并'}
        </button>
      </div>
    </div>
  );
};

export default IssueCard;