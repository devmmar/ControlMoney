import { supabase } from '../lib/supabaseClient'

export async function resetAllData(userId: string): Promise<void> {
  const tables = ['expenses', 'incomes', 'fixed_bills', 'monthly_balances']

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq('user_id', userId)
    if (error) throw new Error(`Erro ao limpar ${table}: ${error.message}`)
  }
}
