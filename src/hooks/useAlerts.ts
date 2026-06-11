import { useMemo } from 'react'
import { formatCurrency } from '../utils/currency'
import type { FinancialSummary } from '../services/summaryService'
import type { FixedBill, Income } from '../types/supabase.types'

export type AlertSeverity = 'danger' | 'warning' | 'info'

export interface Alert {
  id: string
  severity: AlertSeverity
  title: string
  message: string
}

export function useAlerts(
  summary: FinancialSummary | null,
  bills: FixedBill[],
  incomes: Income[]
): Alert[] {
  return useMemo(() => {
    const alerts: Alert[] = []
    if (!summary) return alerts

    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]
    const todayDay = today.getDate()

    if (summary.currentBalance < 0) {
      alerts.push({
        id: 'negative-balance',
        severity: 'danger',
        title: 'Saldo negativo',
        message: `Seu saldo atual é ${formatCurrency(summary.currentBalance)}. Evite novos gastos até regularizar.`,
      })
    } else if (summary.totalFixedBills > 0 && summary.currentBalance < summary.totalFixedBills) {
      alerts.push({
        id: 'low-balance',
        severity: 'warning',
        title: 'Saldo abaixo das contas fixas',
        message: `Saldo atual (${formatCurrency(summary.currentBalance)}) pode não cobrir as contas fixas ativas (${formatCurrency(summary.totalFixedBills)}).`,
      })
    }

    if (summary.totalReceived > 0 && summary.totalExpenses > summary.totalReceived) {
      alerts.push({
        id: 'expenses-over-income',
        severity: 'danger',
        title: 'Gastos superam receitas',
        message: `Suas saídas (${formatCurrency(summary.totalExpenses)}) já ultrapassaram o total recebido (${formatCurrency(summary.totalReceived)}) neste mês.`,
      })
    }

    if (summary.nextMonthForecast < 0) {
      alerts.push({
        id: 'negative-forecast',
        severity: 'warning',
        title: 'Previsão de fechamento negativa',
        message: 'Com base nos dados atuais, você deve fechar o mês no negativo.',
      })
    }

    const soonBills = bills.filter(
      b => b.status === 'active' && b.due_day >= todayDay && b.due_day <= todayDay + 3
    )
    if (soonBills.length > 0) {
      const names = soonBills.map(b => `${b.description} (dia ${b.due_day})`).join(', ')
      alerts.push({
        id: 'bills-due-soon',
        severity: 'info',
        title: `${soonBills.length} conta(s) vencem em até 3 dias`,
        message: names,
      })
    }

    // Entrada em atraso: mês previsto já passou (compara só AAAA-MM)
    const currentMonthStr = todayStr.substring(0, 7)
    const overdueIncomes = incomes.filter(
      i => i.status === 'expected' && i.expected_date.substring(0, 7) < currentMonthStr
    )
    if (overdueIncomes.length > 0) {
      alerts.push({
        id: 'overdue-income',
        severity: 'warning',
        title: `${overdueIncomes.length} entrada(s) em atraso`,
        message: 'Entradas previstas que passaram da data esperada e ainda não foram marcadas como recebidas.',
      })
    }

    return alerts
  }, [summary, bills, incomes])
}
