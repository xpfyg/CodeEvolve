import React, { useState, useEffect } from 'react';
import { Issue, CreateIssueRequest } from './types/index';
import apiService from './api';
import InputBox from './components/InputBox';
import IssueList from './components/IssueList';

function App() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // 加载 Issues 列表
  const loadIssues = async () => {
    setLoading(true);
    try {
      const data = await apiService.getIssues();
      setIssues(data);
    } catch (error) {
      console.error('Failed to load issues:', error);
      // 如果API不可用，使用模拟数据
      setIssues([
        {
          id: 1,
          title: '实现用户登录功能',
          description: '需要实现用户登录页面，包括用户名密码验证、记住登录状态等功能',
          status: 'open',
          branch_name: 'feature/user-login',
          pr_status: 'draft'
        },
        {
          id: 2,
          title: '优化首页加载性能',
          description: '首页加载速度较慢，需要优化图片加载、减少API调用次数',
          status: 'in_progress',
          branch_name: 'feature/homepage-optimization',
          preview_url: 'http://localhost:3001/preview/2',
          pr_status: 'open',
          pr_url: 'https://github.com/example/repo/pull/2'
        },
        {
          id: 3,
          title: '添加数据导出功能',
          description: '用户需要能够导出表格数据为Excel格式',
          status: 'completed',
          branch_name: 'feature/data-export',
          preview_url: 'http://localhost:3001/preview/3',
          pr_status: 'merged',
          pr_url: 'https://github.com/example/repo/pull/3'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 创建新 Issue
  const handleCreateIssue = async (data: CreateIssueRequest) => {
    setCreateLoading(true);
    try {
      const newIssue = await apiService.createIssue(data);
      setIssues(prev => [newIssue, ...prev]);
    } catch (error) {
      console.error('Failed to create issue:', error);
      // 模拟创建成功
      const mockIssue: Issue = {
        id: Date.now(),
        title: data.title,
        description: data.description,
        status: 'open'
      };
      setIssues(prev => [mockIssue, ...prev]);
    } finally {
      setCreateLoading(false);
    }
  };

  // 创建分支
  const handleCreateBranch = async (id: number) => {
    try {
      const result = await apiService.createBranch(id);
      setIssues(prev => prev.map(issue =>
        issue.id === id
          ? { ...issue, branch_name: result.branch_name, status: result.status }
          : issue
      ));
    } catch (error) {
      console.error('Failed to create branch:', error);
      // 模拟创建分支
      setIssues(prev => prev.map(issue =>
        issue.id === id
          ? { ...issue, branch_name: `feature/issue-${id}`, status: 'in_progress' }
          : issue
      ));
    }
  };

  // 提交 PR
  const handleCreatePR = async (id: number) => {
    try {
      const result = await apiService.createPR(id);
      setIssues(prev => prev.map(issue =>
        issue.id === id
          ? { ...issue, pr_url: result.pr_url, pr_status: result.pr_status }
          : issue
      ));
    } catch (error) {
      console.error('Failed to create PR:', error);
      // 模拟创建PR
      setIssues(prev => prev.map(issue =>
        issue.id === id
          ? {
              ...issue,
              pr_url: `https://github.com/example/repo/pull/${id}`,
              pr_status: 'open'
            }
          : issue
      ));
    }
  };

  // 合并 PR
  const handleMergePR = async (id: number) => {
    try {
      const result = await apiService.mergePR(id);
      setIssues(prev => prev.map(issue =>
        issue.id === id
          ? { ...issue, pr_status: result.pr_status, status: 'completed' }
          : issue
      ));
    } catch (error) {
      console.error('Failed to merge PR:', error);
      // 模拟合并PR
      setIssues(prev => prev.map(issue =>
        issue.id === id
          ? { ...issue, pr_status: 'merged', status: 'completed' }
          : issue
      ));
    }
  };

  // 获取预览
  const handleGetPreview = async (id: number) => {
    try {
      const result = await apiService.getPreview(id);
      setIssues(prev => prev.map(issue =>
        issue.id === id
          ? { ...issue, preview_url: result.preview_url }
          : issue
      ));
    } catch (error) {
      console.error('Failed to get preview:', error);
      // 模拟获取预览
      setIssues(prev => prev.map(issue =>
        issue.id === id
          ? { ...issue, preview_url: `http://localhost:3001/preview/${id}` }
          : issue
      ));
    }
  };

  useEffect(() => {
    loadIssues();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 页面标题 */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CodeEvolve 需求管理平台
          </h1>
          <p className="text-gray-600">
            智能代码生成和需求管理系统
          </p>
        </header>

        {/* 输入区域 */}
        <InputBox onSubmit={handleCreateIssue} loading={createLoading} />

        {/* Issue 列表 */}
        <IssueList
          issues={issues}
          loading={loading}
          onCreateBranch={handleCreateBranch}
          onCreatePR={handleCreatePR}
          onMergePR={handleMergePR}
          onGetPreview={handleGetPreview}
        />
      </div>
    </div>
  );
}

export default App;
