import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getFixedBills,
  createFixedBill,
  updateFixedBill,
  deleteFixedBill,
  type CreateFixedBillDTO,
  type UpdateFixedBillDTO,
} from '../services/fixedBillsService'
import type { FixedBill } from '../types/supabase.types'

export function useFixedBills() {
  const { user } = useAuth()
  const [bills, setBills] = useState<FixedBill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await getFixedBills(user.id)
      setBills(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar contas fixas.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetch() }, [fetch])

  const totalActive = bills
    .filter(b => b.status === 'active')
    .reduce((sum, b) => sum + Number(b.amount), 0)

  async function create(dto: CreateFixedBillDTO): Promise<void> {
    if (!user) return
    const created = await createFixedBill(user.id, dto)
    setBills(prev => [...prev, created].sort((a, b) => a.due_day - b.due_day))
  }

  async function update(id: string, dto: UpdateFixedBillDTO): Promise<void> {
    const updated = await updateFixedBill(id, dto)
    setBills(prev => prev.map(b => b.id === id ? updated : b))
  }

  async function remove(id: string): Promise<void> {
    await deleteFixedBill(id)
    setBills(prev => prev.filter(b => b.id !== id))
  }

  async function toggleStatus(bill: FixedBill): Promise<void> {
    const nextStatus = bill.status === 'active' ? 'paused' : 'active'
    await update(bill.id, { status: nextStatus })
  }

  return { bills, totalActive, loading, error, refetch: fetch, create, update, remove, toggleStatus }
}
