// Tipos espelho das tabelas do Supabase
// Atualizar sempre que o schema do banco mudar

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  icon: string | null
  type: 'income' | 'expense' | 'both'
  monthly_limit: number | null
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  user_id: string
  category_id: string | null
  description: string
  amount: number
  date: string
  notes: string | null
  payment_method: 'cash' | 'debit' | 'credit' | 'pix' | 'other' | null
  created_at: string
  updated_at: string
  // join
  category?: Pick<Category, 'id' | 'name' | 'color' | 'icon'>
}

export interface Income {
  id: string
  user_id: string
  category_id: string | null
  description: string
  amount: number
  expected_date: string
  received_date: string | null
  status: 'expected' | 'received' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
  category?: Pick<Category, 'id' | 'name' | 'color' | 'icon'>
}

export interface FixedBill {
  id: string
  user_id: string
  category_id: string | null
  description: string
  amount: number
  due_day: number
  recurrence: 'monthly' | 'annual' | 'custom'
  status: 'active' | 'paused' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
  category?: Pick<Category, 'id' | 'name' | 'color' | 'icon'>
}

export interface MonthlyBalance {
  id: string
  user_id: string
  year: number
  month: number
  opening_balance: number
  closing_balance: number | null
  is_closed: boolean
  closed_at: string | null
  manually_set_opening: boolean
  created_at: string
}
