import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getIncomesByMonth,
  getAllExpectedIncomes,
  createIncome,
  updateIncome,
  markAsReceived,
  deleteIncome,
  carryOverOverdueIncomes,
  type CreateIncomeDTO,
  type UpdateIncomeDTO,
} from '../services/incomesService'
import type { Income } from '../types/supabase.types'

export function useIncomes(year: number, month: number) {
  const { user } = useAuth()
  // Entradas do mês filtrado (recebidas + canceladas)
  const [incomes, setIncomes] = useState<Income[]>([])
  // Todas as entradas previstas (sem filtro de mês) — exibidas globalmente
  const [allExpected, setAllExpected] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMonth = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await getIncomesByMonth(user.id, year, month)
      setIncomes(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar entradas.')
    } finally {
      setLoading(false)
    }
  }, [user, year, month])

  const fetchExpected = useCallback(async () => {
    if (!user) return
    try {
      const data = await getAllExpectedIncomes(user.id)
      setAllExpected(data)
    } catch { /* silencioso */ }
  }, [user])

  useEffect(() => { fetchMonth() }, [fetchMonth])
  useEffect(() => { fetchExpected() }, [fetchExpected])

  const refetchAll = useCallback(async () => {
    await Promise.all([fetchMonth(), fetchExpected()])
  }, [fetchMonth, fetchExpected])

  // totalReceived: mês específico (para os cards do mês)
  const totalReceived = incomes
    .filter(i => i.status === 'received')
    .reduce((sum, i) => sum + Number(i.amount), 0)

  // totalExpected: soma de TODAS as pendentes (para card global no topo)
  const totalExpected = allExpected.reduce((sum, i) => sum + Number(i.amount), 0)

  async function create(dto: CreateIncomeDTO): Promise<void> {
    if (!user) return
    await createIncome(user.id, dto)
    await refetchAll()
  }

  async function receive(id: string, receivedDate: string, actualAmount?: number): Promise<void> {
    await markAsReceived(id, receivedDate, actualAmount)
    await refetchAll()
  }

  async function update(id: string, dto: UpdateIncomeDTO): Promise<void> {
    await updateIncome(id, dto)
    await refetchAll()
  }

  async function remove(id: string): Promise<void> {
    await deleteIncome(id)
    await refetchAll()
  }

  async function carryOver(): Promise<number> {
    if (!user) return 0
    const count = await carryOverOverdueIncomes(user.id)
    if (count > 0) await fetchExpected()
    return count
  }

  return {
    incomes,
    allExpected,
    totalReceived,
    totalExpected,
    loading,
    error,
    refetch: refetchAll,
    create,
    receive,
    update,
    remove,
    carryOver,
  }
}
