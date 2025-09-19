import React, { useState } from 'react';
import { useAppStore, Issue } from '../store';
import apiService from '../api';

interface IssueCardProps {
  issue: Issue;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const {
    repoPath,
    updateIssue,
    isGeneratingCode,
    currentGeneratingIssueId,
    setGeneratingCode
  } = useAppStore();

  const [showFullDescription, setShowFullDescription] = useState(false);

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: Issue['status']) => {
    switch (status) {
      case 'open': return '待处理';
      case 'in_progress': return '进行中';
      case 'completed': return '已完成';
      default: return '未知';
    }
  };

  const getStatusIcon = (status: Issue['status']) => {
    switch (status) {
      case 'open': return '📋';
      case 'in_progress': return '⚡';
      case 'completed': return '✅';
      default: return '❓';
    }
  };

  const isCurrentlyGenerating = isGeneratingCode && currentGeneratingIssueId === issue.id;
  const canStartCoding = issue.status === 'open' && !isGeneratingCode;

  const handleStartCoding = async () => {
    if (!repoPath) {
      console.error('No repository path available');
      return;
    }

    setGeneratingCode(true, issue.id);
    updateIssue(issue.id, { status: 'in_progress' });

    try {
      const result = await apiService.startCoding({
        issueId: issue.id,
        requirement: issue.description,
        repoPath: repoPath,
        branchName: `feature/issue-${issue.id}`,
      });

      if (result.success) {
        updateIssue(issue.id, {
          status: 'completed',
          branch_name: result.branch_name,
        });
      } else {
        updateIssue(issue.id, { status: 'open' });
      }
    } catch (error) {
      console.error('Failed to start coding:', error);
      updateIssue(issue.id, { status: 'open' });
    } finally {
      setGeneratingCode(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {issue.title}
          </h3>
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <span>#{issue.id}</span>
            {issue.created_at && (
              <span>{formatDate(issue.created_at)}</span>
            )}
            {issue.branch_name && (
              <span className="flex items-center">
                <span className="mr-1">🌿</span>
                {issue.branch_name}
              </span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(issue.status)}`}>
          <span className="mr-1">{getStatusIcon(issue.status)}</span>
          {getStatusText(issue.status)}
        </span>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-gray-700 text-sm leading-relaxed">
          {showFullDescription ? issue.description : truncateDescription(issue.description)}
        </p>
        {issue.description.length > 120 && (
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-blue-600 hover:text-blue-700 text-xs mt-1 font-medium"
          >
            {showFullDescription ? '收起' : '展开更多'}
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          {issue.status === 'completed' && issue.branch_name && (
            <div className="flex items-center text-green-600 text-sm">
              <span className="mr-1">🎉</span>
              <span className="font-medium">代码已生成</span>
            </div>
          )}
          {issue.status === 'in_progress' && !isCurrentlyGenerating && (
            <div className="flex items-center text-yellow-600 text-sm">
              <span className="mr-1">⚡</span>
              <span className="font-medium">开发中</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {canStartCoding && (
            <button
              onClick={handleStartCoding}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
            >
              <span className="mr-2">🚀</span>
              开始编码
            </button>
          )}

          {isCurrentlyGenerating && (
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-lg">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              生成代码中...
            </div>
          )}

          {issue.status === 'completed' && (
            <button
              disabled
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed"
            >
              <span className="mr-2">✅</span>
              已完成
            </button>
          )}
        </div>
      </div>

      {/* Progress Indicator for In Progress Issues */}
      {isCurrentlyGenerating && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center text-blue-700 text-sm">
            <div className="animate-pulse flex items-center">
              <span className="mr-2">🤖</span>
              <span className="font-medium">AI 正在为您生成代码...</span>
            </div>
          </div>
          <div className="mt-2 bg-blue-200 rounded-full h-1">
            <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueCard;