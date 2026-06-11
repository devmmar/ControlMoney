import { supabase } from '../lib/supabaseClient'
import type { MonthlyBalance } from '../types/supabase.types'
import { getTotalExpensesByMonth } from './expensesService'
import { getTotalReceivedByMonth, getAllExpectedIncomes } from './incomesService'
import { getTotalActiveFixedBills } from './fixedBillsService'

export interface FinancialSummary {
  openingBalance: number
  totalReceived: number
  totalExpected: number
  totalExpenses: number
  totalFixedBills: number
  currentBalance: number
  nextMonthForecast: number
}

async function calcPrevMonthBalance(
  userId: string,
  prevYear: number,
  prevMonth: number
): Promise<number> {
  const { data: prev } = await supabase
    .from('monthly_balances')
    .select('*')
    .eq('user_id', userId)
    .eq('year', prevYear)
    .eq('month', prevMonth)
    .single()

  if (!prev) return 0

  // Só usa closing_balance se o mês foi explicitamente fechado
  if (prev.is_closed && prev.closing_balance !== null) return Number(prev.closing_balance)

  // Descobre o opening real do mês anterior: se foi definido manualmente usa o
  // valor salvo; caso contrário recalcula recursivamente para não confiar no
  // opening_balance padrão (0) que pode estar desatualizado no banco.
  let openingBalance: number
  if (prev.manually_set_opening) {
    openingBalance = Number(prev.opening_balance)
  } else {
    const pp = prevMonth === 1 ? 12 : prevMonth - 1
    const py = prevMonth === 1 ? prevYear - 1 : prevYear
    openingBalance = await calcPrevMonthBalance(userId, py, pp)
  }

  const [prevReceived, prevExpenses] = await Promise.all([
    getTotalReceivedByMonth(userId, prevYear, prevMonth),
    getTotalExpensesByMonth(userId, prevYear, prevMonth),
  ])
  return openingBalance + prevReceived - prevExpenses
}

async function getOrCreateMonthlyBalance(
  userId: string,
  year: number,
  month: number
): Promise<MonthlyBalance> {
  const { data: existing } = await supabase
    .from('monthly_balances')
    .select('*')
    .eq('user_id', userId)
    .eq('year', year)
    .eq('month', month)
    .single()

  if (existing) return existing

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear  = month === 1 ? year - 1 : year
  const openingBalance = await calcPrevMonthBalance(userId, prevYear, prevMonth)

  const { data: created, error } = await supabase
    .from('monthly_balances')
    .insert({ user_id: userId, year, month, opening_balance: openingBalance })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return created
}

export async function getFinancialSummary(
  userId: string,
  year: number,
  month: number
): Promise<FinancialSummary> {
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear  = month === 1 ? year - 1 : year

  const [balance, totalReceived, allExpectedList, totalExpenses, totalFixedBills] =
    await Promise.all([
      getOrCreateMonthlyBalance(userId, year, month),
      getTotalReceivedByMonth(userId, year, month),
      getAllExpectedIncomes(userId),
      getTotalExpensesByMonth(userId, year, month),
      getTotalActiveFixedBills(userId),
    ])

  // A Receber é global: soma todas as entradas previstas independente do mês
  const totalExpected = allExpectedList.reduce((sum, i) => sum + Number(i.amount), 0)

  // Se o saldo foi definido manualmente pelo usuário, respeita o valor salvo.
  // Caso contrário, sempre recalcula a partir do mês anterior para refletir
  // mudanças feitas no mês anterior sem precisar "fechar" o mês.
  const openingBalance = balance.manually_set_opening
    ? Number(balance.opening_balance)
    : await calcPrevMonthBalance(userId, prevYear, prevMonth)

  const currentBalance  = openingBalance + totalReceived - totalExpenses
  const nextMonthForecast = currentBalance + totalExpected - totalFixedBills

  return {
    openingBalance,
    totalReceived,
    totalExpected,
    totalExpenses,
    totalFixedBills,
    currentBalance,
    nextMonthForecast,
  }
}

export async function closeMonth(userId: string, year: number, month: number): Promise<void> {
  const summary = await getFinancialSummary(userId, year, month)

  await supabase
    .from('monthly_balances')
    .update({
      closing_balance: summary.currentBalance,
      is_closed: true,
      closed_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('year', year)
    .eq('month', month)
}
