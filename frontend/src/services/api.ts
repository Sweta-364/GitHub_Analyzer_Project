import axios from 'axios'
import type { HealthResponse } from '@/types'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

// ── Health check ──────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>('/health')
  return data
}

// ── SSE streaming URL builder ─────────────────────────────────────────────────
// The actual SSE connection is handled in useAnalysis hook via EventSource.

export function getAnalyzeStreamUrl(username: string, force = false): string {
  const params = new URLSearchParams({ username })
  if (force) params.set('force', 'true')
  return `${BASE_URL}/api/analyze/stream?${params.toString()}`
}
