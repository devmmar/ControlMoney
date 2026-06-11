import { supabase } from '../lib/supabaseClient'
import type { Expense } from '../types/supabase.types'

export type CreateExpenseDTO = {
  description: string
  amount: number
  date: string
  category_id?: string | null
  notes?: string | null
  payment_method?: Expense['payment_method']
}
export type UpdateExpenseDTO = Partial<CreateExpenseDTO>

export async function getExpensesByMonth(
  userId: string,
  year: number,
  month: number
): Promise<Expense[]> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('expenses')
    .select('*, category:categories(id, name, color, icon)')
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getTotalExpensesByMonth(
  userId: string,
  year: number,
  month: number
): Promise<number> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 0).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)

  if (error) throw new Error(error.message)
  return (data ?? []).reduce((sum, e) => sum + Number(e.amount), 0)
}

export async function getExpensesGroupedByDay(
  userId: string,
  year: number,
  month: number
): Promise<Record<string, number>> {
  const expenses = await getExpensesByMonth(userId, year, month)
  return expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.date] = (acc[e.date] ?? 0) + Number(e.amount)
    return acc
  }, {})
}

export async function getExpensesGroupedByCategory(
  userId: string,
  year: number,
  month: number
): Promise<Record<string, number>> {
  const expenses = await getExpensesByMonth(userId, year, month)
  return expenses.reduce<Record<string, number>>((acc, e) => {
    const key = e.category_id ?? 'sem-categoria'
    acc[key] = (acc[key] ?? 0) + Number(e.amount)
    return acc
  }, {})
}

export async function createExpense(userId: string, dto: CreateExpenseDTO): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert({ ...dto, user_id: userId })
    .select('*, category:categories(id, name, color, icon)')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateExpense(id: string, dto: UpdateExpenseDTO): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .update(dto)
    .eq('id', id)
    .select('*, category:categories(id, name, color, icon)')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
