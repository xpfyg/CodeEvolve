import React from 'react';
import { Issue } from '../types/index';
import IssueCard from './IssueCard';

interface IssueListProps {
  issues: Issue[];
  loading: boolean;
  onCreateBranch: (id: number) => Promise<void>;
  onCreatePR: (id: number) => Promise<void>;
  onMergePR: (id: number) => Promise<void>;
  onGetPreview: (id: number) => Promise<void>;
}

const IssueList: React.FC<IssueListProps> = ({
  issues,
  loading,
  onCreateBranch,
  onCreatePR,
  onMergePR,
  onGetPreview,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">暂无需求</h3>
          <p className="text-gray-500">创建您的第一个需求吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          需求列表 ({issues.length})
        </h2>
      </div>

      <div className="grid gap-4">
        {issues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onCreateBranch={onCreateBranch}
            onCreatePR={onCreatePR}
            onMergePR={onMergePR}
            onGetPreview={onGetPreview}
          />
        ))}
      </div>
    </div>
  );
};

export default IssueList;