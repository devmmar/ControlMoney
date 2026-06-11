import { supabase } from '../lib/supabaseClient'
import type { Income } from '../types/supabase.types'

export type CreateIncomeDTO = {
  description: string
  amount: number
  expected_date: string
  category_id?: string | null
  notes?: string | null
}
export type UpdateIncomeDTO = Partial<CreateIncomeDTO & {
  status: Income['status']
  received_date: string | null
}>

export async function getIncomesByMonth(
  userId: string,
  year: number,
  month: number
): Promise<Income[]> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('incomes')
    .select('*, category:categories(id, name, color, icon)')
    .eq('user_id', userId)
    .gte('expected_date', start)
    .lte('expected_date', end)
    .order('expected_date')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getTotalReceivedByMonth(
  userId: string,
  year: number,
  month: number
): Promise<number> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('incomes')
    .select('amount')
    .eq('user_id', userId)
    .eq('status', 'received')
    .gte('expected_date', start)
    .lte('expected_date', end)

  if (error) throw new Error(error.message)
  return (data ?? []).reduce((sum, i) => sum + Number(i.amount), 0)
}

export async function getTotalExpectedByMonth(
  userId: string,
  year: number,
  month: number
): Promise<number> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('incomes')
    .select('amount')
    .eq('user_id', userId)
    .eq('status', 'expected')
    .gte('expected_date', start)
    .lte('expected_date', end)

  if (error) throw new Error(error.message)
  return (data ?? []).reduce((sum, i) => sum + Number(i.amount), 0)
}

export async function createIncome(userId: string, dto: CreateIncomeDTO): Promise<Income> {
  const { data, error } = await supabase
    .from('incomes')
    .insert({ ...dto, user_id: userId, status: 'expected' })
    .select('*, category:categories(id, name, color, icon)')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function markAsReceived(
  id: string,
  receivedDate: string,
  actualAmount?: number
): Promise<Income> {
  const update: UpdateIncomeDTO = {
    status: 'received',
    received_date: receivedDate,
    ...(actualAmount !== undefined && { amount: actualAmount }),
  }
  const { data, error } = await supabase
    .from('incomes')
    .update(update)
    .eq('id', id)
    .select('*, category:categories(id, name, color, icon)')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateIncome(id: string, dto: UpdateIncomeDTO): Promise<Income> {
  const { data, error } = await supabase
    .from('incomes')
    .update(dto)
    .eq('id', id)
    .select('*, category:categories(id, name, color, icon)')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteIncome(id: string): Promise<void> {
  const { error } = await supabase.from('incomes').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getAllExpectedIncomes(userId: string): Promise<Income[]> {
  const { data, error } = await supabase
    .from('incomes')
    .select('*, category:categories(id, name, color, icon)')
    .eq('user_id', userId)
    .eq('status', 'expected')
    .order('expected_date')
  if (error) throw new Error(error.message)
  return data ?? []
}

// Move todas as entradas previstas com mês já passado para o mês atual
export async function carryOverOverdueIncomes(userId: string): Promise<number> {
  const now = new Date()
  const currentMonthISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const { data: overdue, error: fetchErr } = await supabase
    .from('incomes')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'expected')
    .lt('expected_date', currentMonthISO)

  if (fetchErr) throw new Error(fetchErr.message)
  if (!overdue || overdue.length === 0) return 0

  const { error: updateErr } = await supabase
    .from('incomes')
    .update({ expected_date: currentMonthISO })
    .in('id', overdue.map(i => i.id))
  if (updateErr) throw new Error(updateErr.message)

  return overdue.length
}

function nextMonthDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const nm = m === 12 ? 1 : m + 1
  const ny = m === 12 ? y + 1 : y
  const lastDay = new Date(ny, nm, 0).getDate()
  return `${ny}-${String(nm).padStart(2, '0')}-${String(Math.min(d, lastDay)).padStart(2, '0')}`
}

export async function carryOverPendingIncomes(
  userId: string,
  year: number,
  month: number
): Promise<number> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data: pending, error: fetchErr } = await supabase
    .from('incomes')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'expected')
    .gte('expected_date', start)
    .lte('expected_date', end)

  if (fetchErr) throw new Error(fetchErr.message)
  if (!pending || pending.length === 0) return 0

  const newIncomes = pending.map(i => ({
    user_id: userId,
    description: i.description,
    amount: i.amount,
    expected_date: nextMonthDate(i.expected_date),
    category_id: i.category_id,
    notes: i.notes,
    status: 'expected' as const,
  }))

  const { error: insertErr } = await supabase.from('incomes').insert(newIncomes)
  if (insertErr) throw new Error(insertErr.message)

  const { error: updateErr } = await supabase
    .from('incomes')
    .update({ status: 'cancelled' })
    .in('id', pending.map(i => i.id))
  if (updateErr) throw new Error(updateErr.message)

  return pending.length
}
