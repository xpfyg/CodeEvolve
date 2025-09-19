import axios from 'axios';
import {
  Issue,
  CreateIssueRequest,
  CreateIssueResponse,
  CreateBranchResponse,
  CreatePRResponse,
  MergePRResponse,
  PreviewResponse,
} from '../types/index';


const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // 创建 Issue
  createIssue: async (data: CreateIssueRequest): Promise<CreateIssueResponse> => {
    const response = await api.post<CreateIssueResponse>('/issues', data);
    return response.data;
  },

  // 获取 Issue 列表
  getIssues: async (): Promise<Issue[]> => {
    const response = await api.get<Issue[]>('/issues');
    return response.data;
  },

  // 创建分支
  createBranch: async (id: number): Promise<CreateBranchResponse> => {
    const response = await api.post<CreateBranchResponse>(`/issues/${id}/branch`);
    return response.data;
  },

  // 提交 PR
  createPR: async (id: number): Promise<CreatePRResponse> => {
    const response = await api.post<CreatePRResponse>(`/issues/${id}/pr`);
    return response.data;
  },

  // 合并 PR
  mergePR: async (id: number): Promise<MergePRResponse> => {
    const response = await api.post<MergePRResponse>(`/issues/${id}/merge`);
    return response.data;
  },

  // 获取预览
  getPreview: async (id: number): Promise<PreviewResponse> => {
    const response = await api.get<PreviewResponse>(`/issues/${id}/preview`);
    return response.data;
  },
};

export default apiService;