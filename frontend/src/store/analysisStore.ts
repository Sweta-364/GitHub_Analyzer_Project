import { create } from 'zustand'
import type { AnalysisState, ProcessedGitHubData } from '@/types'

interface AnalysisStore extends AnalysisState {
  // Actions
  setUsername: (username: string) => void
  setStatus: (status: AnalysisState['status']) => void
  setGitHubData: (data: ProcessedGitHubData) => void
  appendAnalysisToken: (token: string) => void
  setError: (error: string) => void
  setCached: (cached: boolean) => void
  reset: () => void
}

const initialState: AnalysisState = {
  status: 'idle',
  username: '',
  githubData: null,
  analysisText: '',
  error: null,
  cached: false,
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  ...initialState,

  setUsername: (username) => set({ username }),

  setStatus: (status) => set({ status }),

  setGitHubData: (data) => set({ githubData: data }),

  appendAnalysisToken: (token) =>
    set((state) => ({ analysisText: state.analysisText + token })),

  setError: (error) => set({ error, status: 'error' }),

  setCached: (cached) => set({ cached }),

  reset: () => set(initialState),
}))
