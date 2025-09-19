import React, { useState, useEffect } from 'react';
import {
  Issue,
  CreateIssueRequest,
  CodeModificationRequest,
  CodeModificationResponse,
  CodeAnalysisRequest,
  CodeAnalysisResponse,
  TestGenerationRequest,
  TestGenerationResponse,
} from './types/index';
import apiService from './api';
import InputBox from './components/InputBox';
import IssueList from './components/IssueList';
import CodeGenerationForm from './components/CodeGenerationForm';
import CodeAnalysisForm from './components/CodeAnalysisForm';
import TestGenerationForm from './components/TestGenerationForm';
import ResultsDisplay from './components/ResultsDisplay';

function App() {
  const [activeTab, setActiveTab] = useState<'issues' | 'code-gen' | 'analysis' | 'tests'>('code-gen');

  // Issue management state
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // AI Code Generation state
  const [codeGenLoading, setCodeGenLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [testGenLoading, setTestGenLoading] = useState(false);

  // Results state
  const [codeGenResult, setCodeGenResult] = useState<CodeModificationResponse | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CodeAnalysisResponse | null>(null);
  const [testGenResult, setTestGenResult] = useState<TestGenerationResponse | null>(null);

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

  // Handle code generation
  const handleCodeGeneration = async (data: CodeModificationRequest) => {
    setCodeGenLoading(true);
    setCodeGenResult(null);
    try {
      const result = await apiService.generateCode(data);
      setCodeGenResult(result);
    } catch (error) {
      console.error('Failed to generate code:', error);
      // Mock response for demo
      const mockResult: CodeModificationResponse = {
        success: false,
        branch_name: data.branch_name || 'feature-generated',
        message: 'API 服务不可用，这是模拟响应',
        modified_files: ['src/example.py', 'tests/test_example.py']
      };
      setCodeGenResult(mockResult);
    } finally {
      setCodeGenLoading(false);
    }
  };

  // Handle code analysis
  const handleCodeAnalysis = async (data: CodeAnalysisRequest) => {
    setAnalysisLoading(true);
    setAnalysisResult(null);
    try {
      const result = await apiService.analyzeCode(data);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Failed to analyze code:', error);
      // Mock response for demo
      const mockResult: CodeAnalysisResponse = {
        success: false,
        analysis: {
          complexity: 'medium',
          maintainability: 'good',
          test_coverage: '75%',
          code_smells: ['long_method', 'duplicate_code']
        },
        suggestions: [
          '考虑将长方法拆分为更小的函数',
          '添加类型注解提高代码可读性',
          '增加单元测试覆盖率'
        ]
      };
      setAnalysisResult(mockResult);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Handle test generation
  const handleTestGeneration = async (data: TestGenerationRequest) => {
    setTestGenLoading(true);
    setTestGenResult(null);
    try {
      const result = await apiService.generateTests(data);
      setTestGenResult(result);
    } catch (error) {
      console.error('Failed to generate tests:', error);
      // Mock response for demo
      const mockResult: TestGenerationResponse = {
        success: false,
        test_content: `import unittest\nfrom src.utils import calculate\n\nclass TestCalculate(unittest.TestCase):\n    def test_addition(self):\n        self.assertEqual(calculate(2, 3, '+'), 5)\n\n    def test_subtraction(self):\n        self.assertEqual(calculate(5, 3, '-'), 2)`,
        test_file_path: data.test_file_path || 'tests/test_generated.py'
      };
      setTestGenResult(mockResult);
    } finally {
      setTestGenLoading(false);
    }
  };

  // Legacy issue management functions
  const handleCreateIssue = async (data: CreateIssueRequest) => {
    setCreateLoading(true);
    try {
      const newIssue = await apiService.createIssue(data);
      setIssues(prev => [newIssue, ...prev]);
    } catch (error) {
      console.error('Failed to create issue:', error);
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
      setIssues(prev => prev.map(issue =>
        issue.id === id
          ? { ...issue, branch_name: `feature/issue-${id}`, status: 'in_progress' }
          : issue
      ));
    }
  };

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
      setIssues(prev => prev.map(issue =>
        issue.id === id
          ? { ...issue, pr_status: 'merged', status: 'completed' }
          : issue
      ));
    }
  };

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
      setIssues(prev => prev.map(issue =>
        issue.id === id
          ? { ...issue, preview_url: `http://localhost:3001/preview/${id}` }
          : issue
      ));
    }
  };

  const clearResults = () => {
    setCodeGenResult(null);
    setAnalysisResult(null);
    setTestGenResult(null);
  };

  useEffect(() => {
    if (activeTab === 'issues') {
      loadIssues();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'code-gen', label: '代码生成', icon: '🚀' },
    { id: 'analysis', label: '代码分析', icon: '🔍' },
    { id: 'tests', label: '测试生成', icon: '🧪' },
    { id: 'issues', label: '需求管理', icon: '📋' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 页面标题 */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CodeEvolve AI 代码生成平台
          </h1>
          <p className="text-gray-600">
            智能代码生成、分析和测试平台
          </p>
        </header>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'issues' | 'code-gen' | 'analysis' | 'tests')}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'code-gen' && (
          <>
            <CodeGenerationForm onSubmit={handleCodeGeneration} loading={codeGenLoading} />
            <ResultsDisplay
              codeGeneration={codeGenResult}
              onClear={codeGenResult ? clearResults : undefined}
            />
          </>
        )}

        {activeTab === 'analysis' && (
          <>
            <CodeAnalysisForm onSubmit={handleCodeAnalysis} loading={analysisLoading} />
            <ResultsDisplay
              codeAnalysis={analysisResult}
              onClear={analysisResult ? clearResults : undefined}
            />
          </>
        )}

        {activeTab === 'tests' && (
          <>
            <TestGenerationForm onSubmit={handleTestGeneration} loading={testGenLoading} />
            <ResultsDisplay
              testGeneration={testGenResult}
              onClear={testGenResult ? clearResults : undefined}
            />
          </>
        )}

        {activeTab === 'issues' && (
          <>
            <InputBox onSubmit={handleCreateIssue} loading={createLoading} />
            <IssueList
              issues={issues}
              loading={loading}
              onCreateBranch={handleCreateBranch}
              onCreatePR={handleCreatePR}
              onMergePR={handleMergePR}
              onGetPreview={handleGetPreview}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
