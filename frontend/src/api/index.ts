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