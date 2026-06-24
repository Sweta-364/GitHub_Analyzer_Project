import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAnalysisStore } from '@/store/analysisStore'
import { getAnalyzeStreamUrl } from '@/services/api'
import type { StreamEvent, ProcessedGitHubData } from '@/types'

export function useAnalysis() {
  const navigate = useNavigate()
  const {
    setStatus,
    setGitHubData,
    appendAnalysisToken,
    setError,
    setCached,
    reset,
  } = useAnalysisStore()

  const startAnalysis = useCallback(
    (username: string, force = false) => {
      reset()
      setStatus('fetching_github')
      navigate(`/analyze/${username}`)

      const url = getAnalyzeStreamUrl(username, force)
      const es = new EventSource(url)

      es.onmessage = (event: MessageEvent<string>) => {
        let parsed: StreamEvent
        try {
          parsed = JSON.parse(event.data) as StreamEvent
        } catch {
          return
        }

        switch (parsed.type) {
          case 'cached':
            setCached(true)
            break
          case 'data':
            setGitHubData(parsed.payload as ProcessedGitHubData)
            setStatus('streaming_analysis')
            break
          case 'token':
            appendAnalysisToken(parsed.payload as string)
            break
          case 'done':
            setStatus('complete')
            es.close()
            break
          case 'error':
            setError(parsed.payload as string)
            es.close()
            break
        }
      }

      es.onerror = () => {
        setError('Connection lost. Please try again.')
        es.close()
      }
    },
    [navigate, reset, setStatus, setGitHubData, appendAnalysisToken, setError, setCached]
  )

  return { startAnalysis }
}
