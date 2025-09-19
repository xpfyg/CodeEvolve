// Code Generation Requests
export interface CodeModificationRequest {
  requirement: string;
  repo_path: string;
  target_files?: string[];
  branch_name?: string;
}

export interface CodeModificationResponse {
  success: boolean;
  branch_name: string;
  commit_hash?: string;
  message: string;
  modified_files?: string[];
}

// Code Analysis Requests
export interface CodeAnalysisRequest {
  repo_path: string;
  file_path: string;
}

export interface CodeAnalysisResponse {
  success: boolean;
  analysis: {
    complexity?: string;
    maintainability?: string;
    test_coverage?: string;
    code_smells?: string[];
    [key: string]: unknown;
  };
  suggestions?: string[];
}

// Test Generation Requests
export interface TestGenerationRequest {
  repo_path: string;
  file_path: string;
  test_file_path?: string;
}

export interface TestGenerationResponse {
  success: boolean;
  test_content: string;
  test_file_path: string;
}

// Repository Management
export interface RepositoryBranchesResponse {
  branches: string[];
}

export interface RepositoryFilesResponse {
  files: string[];
}

// Health Check Response
export interface HealthResponse {
  status: string;
  service?: string;
  timestamp?: string;
}

// Legacy Issue types for existing components
export interface Issue {
  id: number;
  title: string;
  description: string;
  status: string;
  branch_name?: string;
  preview_url?: string;
  pr_status?: string;
  pr_url?: string;
}

export interface CreateIssueRequest {
  title: string;
  description: string;
}

export type CreateIssueResponse = Issue;

export interface CreateBranchResponse {
  id: number;
  branch_name: string;
  status: string;
}

export interface CreatePRResponse {
  id: number;
  pr_url: string;
  pr_status: string;
}

export interface MergePRResponse {
  id: number;
  pr_status: string;
}

export interface PreviewResponse {
  id: number;
  preview_url: string;
  status: string;
}

export type IssueStatus = 'open' | 'in_progress' | 'completed' | 'closed';
export type PRStatus = 'draft' | 'open' | 'merged' | 'closed';