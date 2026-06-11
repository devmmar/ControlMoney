import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getExpensesByMonth,
  createExpense,
  updateExpense,
  deleteExpense,
  type CreateExpenseDTO,
  type UpdateExpenseDTO,
} from '../services/expensesService'
import type { Expense } from '../types/supabase.types'

export function useExpenses(year: number, month: number) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await getExpensesByMonth(user.id, year, month)
      setExpenses(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar saídas.')
    } finally {
      setLoading(false)
    }
  }, [user, year, month])

  useEffect(() => { fetch() }, [fetch])

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  async function create(dto: CreateExpenseDTO): Promise<void> {
    if (!user) return
    const created = await createExpense(user.id, dto)
    setExpenses(prev => [created, ...prev])
  }

  async function update(id: string, dto: UpdateExpenseDTO): Promise<void> {
    const updated = await updateExpense(id, dto)
    setExpenses(prev => prev.map(e => e.id === id ? updated : e))
  }

  async function remove(id: string): Promise<void> {
    await deleteExpense(id)
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  return { expenses, total, loading, error, refetch: fetch, create, update, remove }
}
