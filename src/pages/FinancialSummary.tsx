import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Pencil, TrendingDown, TrendingUp, CalendarDays, Wallet, ArrowLeftRight, Telescope } from 'lucide-react'
import { useFinancialSummary } from '../hooks/useFinancialSummary'
import { useExpenses } from '../hooks/useExpenses'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { formatCurrency } from '../utils/currency'
import { formatMonthYear } from '../utils/date'
import { Modal } from '../components/ui/Modal'
import { ToastContainer, useToast } from '../components/ui/Toast'

function SummaryCard({
  label, value, sub, color, icon: Icon, highlight = false,
}: {
  label: string
  value: number
  sub?: string
  color: string
  icon: React.ElementType
  highlight?: boolean
}) {
  const isNeg = value < 0
  const valueColor = isNeg ? 'text-danger' : color

  return (
    <div className={`bg-white rounded-xl border shadow-sm p-5 ${highlight ? 'border-primary-200 ring-1 ring-primary-100' : 'border-gray-100'}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${highlight ? 'bg-primary-100' : 'bg-gray-100'}`}>
          <Icon className={`w-4 h-4 ${highlight ? 'text-primary-600' : 'text-gray-500'}`} />
        </div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${highlight ? 'text-3xl' : ''} ${valueColor}`}>
        {formatCurrency(value)}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export function FinancialSummaryPage() {
  const { user } = useAuth()
  const { toasts, show, remove: removeToast } = useToast()

  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const { summary, loading, error, refetch } = useFinancialSummary(year, month)
  const { expenses } = useExpenses(year, month)

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; color: string; total: number }>()
    for (const e of expenses) {
      const key   = e.category?.id ?? '__sem_categoria__'
      const name  = e.category?.name ?? 'Sem categoria'
      const color = e.category?.color ?? '#9ca3af'
      const prev  = map.get(key)
      map.set(key, { name, color, total: (prev?.total ?? 0) + Number(e.amount) })
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total)
  }, [expenses])

  // Modal de edição do saldo inicial
  const [isEditBalanceOpen, setIsEditBalanceOpen] = useState(false)
  const [balanceInput, setBalanceInput] = useState('')
  const [savingBalance, setSavingBalance] = useState(false)

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  function openEditBalance() {
    setBalanceInput(summary ? String(summary.openingBalance) : '0')
    setIsEditBalanceOpen(true)
  }

  async function saveBalance() {
    if (!user) return
    const value = parseFloat(balanceInput.replace(',', '.'))
    if (isNaN(value)) { show('Valor inválido.', 'error'); return }

    setSavingBalance(true)
    try {
      const { error: err } = await supabase
        .from('monthly_balances')
        .upsert(
          { user_id: user.id, year, month, opening_balance: value, manually_set_opening: true },
          { onConflict: 'user_id,year,month' }
        )
      if (err) throw new Error(err.message)
      setIsEditBalanceOpen(false)
      show('Saldo inicial atualizado!')
      refetch()
    } catch (e) {
      show(e instanceof Error ? e.message : 'Erro ao salvar.', 'error')
    } finally {
      setSavingBalance(false)
    }
  }

  const forecastColor = summary && summary.nextMonthForecast >= 0 ? 'text-success' : 'text-danger'

  return (
    <div className="space-y-6">
      {/* Header com navegação de mês */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Resumo Financeiro</h1>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-1 py-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-700 px-2 capitalize min-w-[140px] text-center">
            {formatMonthYear(year, month)}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      )}

      {error && (
        <div className="bg-danger-light text-danger-text text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {!loading && summary && (
        <>
          {/* Cards principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Saldo atual — destaque */}
            <div className="sm:col-span-2 lg:col-span-3 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white shadow-md">
              <p className="text-sm font-medium text-primary-200 uppercase tracking-wide mb-2">Saldo Atual</p>
              <p className="text-4xl font-bold">{formatCurrency(summary.currentBalance)}</p>
              <p className="text-sm text-primary-200 mt-1">
                Saldo herdado + recebido − saídas
              </p>
            </div>

            {/* Saldo do mês anterior */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Saldo herdado</p>
                </div>
                <button
                  onClick={openEditBalance}
                  className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  title="Editar saldo inicial"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
              <p className={`text-2xl font-bold ${summary.openingBalance < 0 ? 'text-danger' : 'text-gray-900'}`}>
                {formatCurrency(summary.openingBalance)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Sobrou do mês anterior</p>
            </div>

            <SummaryCard
              label="Já Recebido"
              value={summary.totalReceived}
              sub="Entradas confirmadas"
              color="text-success"
              icon={TrendingUp}
            />
            <SummaryCard
              label="A Receber"
              value={summary.totalExpected}
              sub="Entradas previstas"
              color="text-info"
              icon={Wallet}
            />
            <SummaryCard
              label="Total de Saídas"
              value={-summary.totalExpenses}
              sub="Gastos registrados"
              color="text-danger"
              icon={TrendingDown}
            />
            <SummaryCard
              label="Contas Fixas"
              value={-summary.totalFixedBills}
              sub="Total mensal previsto"
              color="text-warning-text"
              icon={CalendarDays}
            />

            {/* Previsão próximo mês */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Telescope className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Previsão próx. mês</p>
              </div>
              <p className={`text-2xl font-bold ${forecastColor}`}>
                {formatCurrency(summary.nextMonthForecast)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {summary.nextMonthForecast >= 0
                  ? 'Saldo previsto ao fechar o mês'
                  : '⚠ Previsão negativa — revise os gastos'}
              </p>
            </div>
          </div>

          {/* Resumo de saídas por categoria */}
          {categoryBreakdown.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Saídas por categoria — <span className="capitalize font-normal text-gray-400">{formatMonthYear(year, month)}</span>
              </h3>
              <div className="space-y-3">
                {categoryBreakdown.map(cat => {
                  const pct = summary.totalExpenses > 0
                    ? Math.round((cat.total / summary.totalExpenses) * 100)
                    : 0
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-sm text-gray-700 truncate">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className="text-xs text-gray-400">{pct}%</span>
                          <span className="text-sm font-semibold text-danger">{formatCurrency(cat.total)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Cálculo explicativo */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Como o saldo foi calculado</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">Saldo herdado</span>
                <span className={`font-medium ${summary.openingBalance < 0 ? 'text-danger' : 'text-gray-900'}`}>
                  {formatCurrency(summary.openingBalance)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">+ Já recebido</span>
                <span className="font-medium text-success">+{formatCurrency(summary.totalReceived)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-50">
                <span className="text-gray-500">− Total de saídas</span>
                <span className="font-medium text-danger">-{formatCurrency(summary.totalExpenses)}</span>
              </div>
              <div className="flex justify-between items-center py-2 font-semibold">
                <span className="text-gray-700">= Saldo Atual</span>
                <span className={summary.currentBalance < 0 ? 'text-danger' : 'text-success'}>
                  {formatCurrency(summary.currentBalance)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal editar saldo inicial */}
      <Modal isOpen={isEditBalanceOpen} onClose={() => setIsEditBalanceOpen(false)} title="Definir saldo inicial" maxWidth="sm">
        <p className="text-sm text-gray-500 mb-4">
          Informe o valor que você tinha disponível no início de <strong className="text-gray-700 capitalize">{formatMonthYear(year, month)}</strong>.
          Pode ser o saldo em conta, dinheiro em mãos, ou o total que você considera seu saldo de partida.
        </p>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Saldo inicial</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
            <input
              type="number"
              step="0.01"
              value={balanceInput}
              onChange={e => setBalanceInput(e.target.value)}
              placeholder="0,00"
              autoFocus
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Use valor negativo se você já começou o mês no negativo.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditBalanceOpen(false)}
            className="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={saveBalance}
            disabled={savingBalance}
            className="flex-1 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {savingBalance && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            Salvar
          </button>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
