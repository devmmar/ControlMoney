import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, TrendingDown, TrendingUp, Wallet,
  CalendarDays, AlertTriangle, Info, AlertCircle, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useFinancialSummary } from '../hooks/useFinancialSummary'
import { useExpenses } from '../hooks/useExpenses'
import { useFixedBills } from '../hooks/useFixedBills'
import { useIncomes } from '../hooks/useIncomes'
import { useAlerts, type Alert } from '../hooks/useAlerts'
import { formatCurrency } from '../utils/currency'
import { getCurrentMonthRange, monthYearFromDate, todayISO } from '../utils/date'
import { ROUTES } from '../constants/routes'

const ALERT_ICON: Record<Alert['severity'], React.ElementType> = {
  danger:  AlertCircle,
  warning: AlertTriangle,
  info:    Info,
}
const ALERT_STYLE: Record<Alert['severity'], string> = {
  danger:  'bg-red-50 border-red-100 text-red-700',
  warning: 'bg-amber-50 border-amber-100 text-amber-700',
  info:    'bg-sky-50 border-sky-100 text-sky-700',
}

function AlertCard({ alert }: { alert: Alert }) {
  const Icon = ALERT_ICON[alert.severity]
  return (
    <div className={`flex gap-3 px-4 py-3 rounded-xl border text-sm ${ALERT_STYLE[alert.severity]}`}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <div>
        <p className="font-semibold leading-tight">{alert.title}</p>
        <p className="text-xs opacity-80 mt-0.5">{alert.message}</p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const { year, month } = getCurrentMonthRange()

  const { summary, loading: summaryLoading }   = useFinancialSummary(year, month)
  const { expenses, loading: expLoading }       = useExpenses(year, month)
  const { bills, loading: billsLoading }        = useFixedBills()
  const { incomes, allExpected, loading: incomesLoading } = useIncomes(year, month)

  const alerts = useAlerts(summary, bills, allExpected)

  const todayDay = new Date().getDate()
  const todayStr = todayISO()

  const upcomingBills = useMemo(() =>
    bills
      .filter(b => b.status === 'active' && b.due_day >= todayDay && b.due_day <= todayDay + 7)
      .sort((a, b) => a.due_day - b.due_day),
    [bills, todayDay]
  )

  const upcomingIncomes = useMemo(() => {
    // Mostra todas as previstas globais (allExpected já é só status=expected)
    return allExpected
      .slice()
      .sort((a, b) => a.expected_date.localeCompare(b.expected_date))
      .slice(0, 5)
  }, [allExpected])

  const last7Days = useMemo(() => {
    const result: { label: string; date: string; total: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const total = expenses
        .filter(e => e.date === dateStr)
        .reduce((s, e) => s + Number(e.amount), 0)
      result.push({
        label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        date: dateStr,
        total,
      })
    }
    return result
  }, [expenses])

  const maxLast7 = Math.max(...last7Days.map(d => d.total), 0.01)
  const isLoading = summaryLoading || expLoading || billsLoading || incomesLoading
  const firstName = user?.email?.split('@')[0] ?? 'usuário'
  const hasData = expenses.length > 0 || bills.length > 0 || incomes.length > 0 || allExpected.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Olá, <span className="font-medium text-gray-700">{firstName}</span>!
          </p>
        </div>
        <Link
          to={ROUTES.EXPENSES}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />Nova Saída
        </Link>
      </div>

      {/* Summary cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className={`rounded-xl p-4 shadow-md text-white col-span-2 lg:col-span-1 bg-gradient-to-br ${summary && summary.currentBalance < 0 ? 'from-red-600 to-red-700' : 'from-primary-600 to-primary-700'}`}>
            <p className="text-xs font-medium text-white/70 uppercase tracking-wide">Saldo Atual</p>
            <p className="text-2xl font-bold mt-1">
              {summary ? formatCurrency(summary.currentBalance) : '—'}
            </p>
            <Link to={ROUTES.FINANCIAL_SUMMARY} className="text-xs text-white/60 mt-1 hover:text-white/90 transition-colors inline-flex items-center gap-0.5">
              Ver resumo <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-danger" />
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Saídas</p>
            </div>
            <p className="text-xl font-bold text-danger">
              {summary ? formatCurrency(summary.totalExpenses) : '—'}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-success" />
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Recebido</p>
            </div>
            <p className="text-xl font-bold text-success">
              {summary ? formatCurrency(summary.totalReceived) : '—'}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <CalendarDays className="w-3.5 h-3.5 text-warning-text" />
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Contas Fixas</p>
            </div>
            <p className="text-xl font-bold text-warning-text">
              {summary ? formatCurrency(summary.totalFixedBills) : '—'}
            </p>
          </div>
        </div>
      )}

      {/* Alerts */}
      {!isLoading && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(a => <AlertCard key={a.id} alert={a} />)}
        </div>
      )}

      {/* Upcoming bills + incomes */}
      {!isLoading && hasData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-900">Próximas contas fixas</p>
              <Link to={ROUTES.FIXED_BILLS} className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
                Ver todas <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {upcomingBills.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Nenhuma conta nos próximos 7 dias.
              </p>
            ) : (
              <div className="divide-y divide-gray-50">
                {upcomingBills.map(b => (
                  <div key={b.id} className="flex items-center gap-3 px-4 py-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: b.category?.color ?? '#f59e0b' }}
                    >
                      {b.description[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{b.description}</p>
                      <p className="text-xs text-gray-400">Vence dia {b.due_day}</p>
                    </div>
                    <span className="text-sm font-semibold text-warning-text shrink-0">
                      {formatCurrency(Number(b.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <p className="text-sm font-semibold text-gray-900">Entradas previstas</p>
              <Link to={ROUTES.INCOMES} className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
                Ver todas <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {upcomingIncomes.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                Nenhuma entrada nos próximos 7 dias.
              </p>
            ) : (
              <div className="divide-y divide-gray-50">
                {upcomingIncomes.map(i => (
                  <div key={i.id} className="flex items-center gap-3 px-4 py-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: i.category?.color ?? '#10b981' }}
                    >
                      {i.description[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{i.description}</p>
                      <p className="text-xs text-gray-400">{monthYearFromDate(i.expected_date)}</p>
                    </div>
                    <span className="text-sm font-semibold text-success shrink-0">
                      +{formatCurrency(Number(i.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mini chart: last 7 days */}
      {!isLoading && hasData && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-900">Saídas — últimos 7 dias</p>
            <Link to={ROUTES.DAILY_SUMMARY} className="text-xs text-primary-600 hover:underline flex items-center gap-0.5">
              Resumo diário <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex items-end gap-1.5" style={{ height: '64px' }}>
            {last7Days.map(d => {
              const pct = d.total > 0 ? Math.max((d.total / maxLast7) * 100, 10) : 0
              const isToday = d.date === todayStr
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end" style={{ height: '48px' }}>
                    {d.total > 0 ? (
                      <div
                        className={`w-full rounded-t transition-all ${isToday ? 'bg-primary-600' : 'bg-primary-300'}`}
                        style={{ height: `${pct}%` }}
                      />
                    ) : (
                      <div className="w-full rounded-t bg-gray-100" style={{ height: '3px' }} />
                    )}
                  </div>
                  <span className={`text-[10px] leading-none ${isToday ? 'font-semibold text-primary-600' : 'text-gray-400'}`}>
                    {d.label}
                  </span>
                </div>
              )
            })}
          </div>
          {last7Days.every(d => d.total === 0) && (
            <p className="text-xs text-gray-400 text-center mt-2">
              Nenhuma saída nos últimos 7 dias.
            </p>
          )}
        </div>
      )}

      {/* Welcome / empty state */}
      {!isLoading && !hasData && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 shadow-sm text-center">
          <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-7 h-7 text-primary-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Bem-vindo ao ControlMoney!
          </h3>
          <p className="text-sm text-gray-500 max-w-xs mx-auto mb-5">
            Comece registrando suas saídas e entradas para ver o resumo financeiro aqui.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={ROUTES.EXPENSES}
              className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              <TrendingDown className="w-4 h-4" />Registrar saída
            </Link>
            <Link
              to={ROUTES.CATEGORIES}
              className="flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
            >
              Criar categorias
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
