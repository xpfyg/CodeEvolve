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