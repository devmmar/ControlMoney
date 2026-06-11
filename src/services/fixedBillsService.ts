import { supabase } from '../lib/supabaseClient'
import type { FixedBill } from '../types/supabase.types'

export type CreateFixedBillDTO = {
  description: string
  amount: number
  due_day: number
  recurrence: FixedBill['recurrence']
  category_id?: string | null
  notes?: string | null
  status?: FixedBill['status']
}
export type UpdateFixedBillDTO = Partial<CreateFixedBillDTO>

export async function getFixedBills(userId: string): Promise<FixedBill[]> {
  const { data, error } = await supabase
    .from('fixed_bills')
    .select('*, category:categories(id, name, color, icon)')
    .eq('user_id', userId)
    .order('due_day')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getActiveFixedBills(userId: string): Promise<FixedBill[]> {
  const { data, error } = await supabase
    .from('fixed_bills')
    .select('*, category:categories(id, name, color, icon)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('due_day')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getTotalActiveFixedBills(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('fixed_bills')
    .select('amount')
    .eq('user_id', userId)
    .eq('status', 'active')

  if (error) throw new Error(error.message)
  return (data ?? []).reduce((sum, b) => sum + Number(b.amount), 0)
}

export async function getUpcomingBills(userId: string, withinDays = 7): Promise<FixedBill[]> {
  const today = new Date().getDate()
  const limit = today + withinDays

  const bills = await getActiveFixedBills(userId)
  return bills.filter(b => b.due_day >= today && b.due_day <= limit)
}

export async function createFixedBill(userId: string, dto: CreateFixedBillDTO): Promise<FixedBill> {
  const { data, error } = await supabase
    .from('fixed_bills')
    .insert({ ...dto, user_id: userId, status: dto.status ?? 'active' })
    .select('*, category:categories(id, name, color, icon)')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateFixedBill(id: string, dto: UpdateFixedBillDTO): Promise<FixedBill> {
  const { data, error } = await supabase
    .from('fixed_bills')
    .update(dto)
    .eq('id', id)
    .select('*, category:categories(id, name, color, icon)')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteFixedBill(id: string): Promise<void> {
  const { error } = await supabase.from('fixed_bills').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
