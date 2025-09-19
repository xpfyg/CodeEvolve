import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed';
  branch_name?: string;
  created_at?: string;
  updated_at?: string;
}

interface AppState {
  // Repository state
  repoPath: string | null;
  isRepoValid: boolean;

  // Issues state
  issues: Issue[];
  isLoadingIssues: boolean;

  // UI state
  isGeneratingCode: boolean;
  currentGeneratingIssueId: string | null;

  // Actions
  setRepoPath: (path: string | null) => void;
  setRepoValid: (valid: boolean) => void;
  setIssues: (issues: Issue[]) => void;
  addIssue: (issue: Issue) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  setLoadingIssues: (loading: boolean) => void;
  setGeneratingCode: (generating: boolean, issueId?: string) => void;
  clearRepo: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      repoPath: null,
      isRepoValid: false,
      issues: [],
      isLoadingIssues: false,
      isGeneratingCode: false,
      currentGeneratingIssueId: null,

      // Actions
      setRepoPath: (path) => set({ repoPath: path }),

      setRepoValid: (valid) => set({ isRepoValid: valid }),

      setIssues: (issues) => set({ issues }),

      addIssue: (issue) => set((state) => ({
        issues: [issue, ...state.issues]
      })),

      updateIssue: (id, updates) => set((state) => ({
        issues: state.issues.map(issue =>
          issue.id === id ? { ...issue, ...updates } : issue
        )
      })),

      setLoadingIssues: (loading) => set({ isLoadingIssues: loading }),

      setGeneratingCode: (generating, issueId) => set({
        isGeneratingCode: generating,
        currentGeneratingIssueId: generating ? issueId || null : null
      }),

      clearRepo: () => set({
        repoPath: null,
        isRepoValid: false,
        issues: [],
        isLoadingIssues: false,
        isGeneratingCode: false,
        currentGeneratingIssueId: null,
      }),
    }),
    {
      name: 'codeevolve-storage',
      partialize: (state) => ({
        repoPath: state.repoPath,
        isRepoValid: state.isRepoValid,
        issues: state.issues,
      }),
    }
  )
);