import axios from 'axios';
import {
  Issue,
  CreateIssueRequest,
  CreateIssueResponse,
  CreateBranchResponse,
  CreatePRResponse,
  MergePRResponse,
  PreviewResponse,
  CodeModificationRequest,
  CodeModificationResponse,
  CodeAnalysisRequest,
  CodeAnalysisResponse,
  TestGenerationRequest,
  TestGenerationResponse,
  RepositoryBranchesResponse,
  RepositoryFilesResponse,
  HealthResponse,
} from '../types/index';

// New interfaces for the project-driven workflow
export interface RepositoryValidationResponse {
  valid: boolean;
  message?: string;
  repoInfo?: {
    name: string;
    currentBranch: string;
    hasRemote: boolean;
  };
}

export interface IssueResponse {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed';
  branch_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateIssueParams {
  title: string;
  description: string;
  repoPath: string;
}

export interface StartCodingParams {
  issueId: string;
  requirement: string;
  repoPath: string;
  branchName?: string;
}


const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Health Check
  healthCheck: async (): Promise<HealthResponse> => {
    const response = await api.get<HealthResponse>('/health');
    return response.data;
  },

  // New Repository Management for project-driven workflow
  checkRepository: async (repoPath: string): Promise<RepositoryValidationResponse> => {
    try {
      // First try to list branches to verify it's a valid git repo
      const response = await api.get<RepositoryBranchesResponse>(`/repos/${encodeURIComponent(repoPath)}/branches`);

      return {
        valid: true,
        message: '仓库验证成功',
        repoInfo: {
          name: repoPath.split('/').pop() || 'unknown',
          currentBranch: response.data.branches[0] || 'main',
          hasRemote: true
        }
      };
    } catch (error: unknown) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : '无效的 Git 仓库路径'
      };
    }
  },

  // New Issue Management for project-driven workflow
  getRepositoryIssues: async (): Promise<IssueResponse[]> => {
    try {
      // For now, return mock data since backend doesn't have issue management yet
      // TODO: Replace with actual API call when backend supports it
      const mockIssues: IssueResponse[] = [
        {
          id: '1',
          title: '实现用户认证功能',
          description: '添加登录、注册和权限验证功能，包括JWT令牌管理',
          status: 'open',
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: '优化数据库查询性能',
          description: '对频繁查询的表添加索引，优化复杂查询语句',
          status: 'in_progress',
          branch_name: 'feature/issue-2',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        }
      ];

      return new Promise(resolve => {
        setTimeout(() => resolve(mockIssues), 500);
      });
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      return [];
    }
  },

  createRepositoryIssue: async (params: CreateIssueParams): Promise<IssueResponse> => {
    try {
      // TODO: Replace with actual API call when backend supports it
      const newIssue: IssueResponse = {
        id: Date.now().toString(),
        title: params.title,
        description: params.description,
        status: 'open',
        created_at: new Date().toISOString(),
      };

      return new Promise(resolve => {
        setTimeout(() => resolve(newIssue), 300);
      });
    } catch (error) {
      console.error('Failed to create issue:', error);
      throw error;
    }
  },

  startCoding: async (params: StartCodingParams): Promise<CodeModificationResponse> => {
    const codeRequest: CodeModificationRequest = {
      requirement: params.requirement,
      repo_path: params.repoPath,
      branch_name: params.branchName || `feature/issue-${params.issueId}`,
    };

    const response = await api.post<CodeModificationResponse>('/generate-code', codeRequest);
    return response.data;
  },

  // Code Generation
  generateCode: async (data: CodeModificationRequest): Promise<CodeModificationResponse> => {
    const response = await api.post<CodeModificationResponse>('/generate-code', data);
    return response.data;
  },

  // Code Analysis
  analyzeCode: async (data: CodeAnalysisRequest): Promise<CodeAnalysisResponse> => {
    const response = await api.post<CodeAnalysisResponse>('/api/v1/analyze-code', data);
    return response.data;
  },

  // Test Generation
  generateTests: async (data: TestGenerationRequest): Promise<TestGenerationResponse> => {
    const response = await api.post<TestGenerationResponse>('/api/v1/generate-tests', data);
    return response.data;
  },

  // Repository Management
  listBranches: async (repoPath: string): Promise<RepositoryBranchesResponse> => {
    const response = await api.get<RepositoryBranchesResponse>(`/repos/${encodeURIComponent(repoPath)}/branches`);
    return response.data;
  },

  listFiles: async (repoPath: string, extension?: string): Promise<RepositoryFilesResponse> => {
    const params = extension ? { extension } : {};
    const response = await api.get<RepositoryFilesResponse>(`/repos/${encodeURIComponent(repoPath)}/files`, { params });
    return response.data;
  },

  // Legacy Issue Management (for existing components)
  createIssue: async (data: CreateIssueRequest): Promise<CreateIssueResponse> => {
    const response = await api.post<CreateIssueResponse>('/issues', data);
    return response.data;
  },

  getIssues: async (): Promise<Issue[]> => {
    const response = await api.get<Issue[]>('/issues');
    return response.data;
  },

  createBranch: async (id: number): Promise<CreateBranchResponse> => {
    const response = await api.post<CreateBranchResponse>(`/issues/${id}/branch`);
    return response.data;
  },

  createPR: async (id: number): Promise<CreatePRResponse> => {
    const response = await api.post<CreatePRResponse>(`/issues/${id}/pr`);
    return response.data;
  },

  mergePR: async (id: number): Promise<MergePRResponse> => {
    const response = await api.post<MergePRResponse>(`/issues/${id}/merge`);
    return response.data;
  },

  getPreview: async (id: number): Promise<PreviewResponse> => {
    const response = await api.get<PreviewResponse>(`/issues/${id}/preview`);
    return response.data;
  },
};

export default apiService;