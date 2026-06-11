import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getFinancialSummary, type FinancialSummary } from '../services/summaryService'

export function useFinancialSummary(year: number, month: number) {
  const { user } = useAuth()
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await getFinancialSummary(user.id, year, month)
      setSummary(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar resumo financeiro.')
    } finally {
      setLoading(false)
    }
  }, [user, year, month])

  useEffect(() => { fetch() }, [fetch])

  return { summary, loading, error, refetch: fetch }
}
