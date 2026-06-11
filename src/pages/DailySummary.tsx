import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react'
import { useExpenses } from '../hooks/useExpenses'
import { formatCurrency } from '../utils/currency'
import { formatMonthYear, getDaysInMonth, formatDate } from '../utils/date'
import type { Expense } from '../types/supabase.types'

export function DailySummaryPage() {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const { expenses, loading, error } = useExpenses(year, month)

  const todayStr = now.toISOString().split('T')[0]

  function prevMonth() {
    setSelectedDay(null)
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    setSelectedDay(null)
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const days = useMemo(() => getDaysInMonth(year, month), [year, month])

  const byDay = useMemo(() => {
    const map: Record<string, Expense[]> = {}
    for (const e of expenses) {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    }
    return map
  }, [expenses])

  const dailyTotals = useMemo(() =>
    days.map(d => ({
      date: d,
      day: parseInt(d.split('-')[2]),
      total: (byDay[d] ?? []).reduce((sum, e) => sum + Number(e.amount), 0),
      isFuture: d > todayStr,
      isToday: d === todayStr,
    })),
    [days, byDay, todayStr]
  )

  const daysWithSpend = dailyTotals.filter(d => d.total > 0)
  const totalSpend = daysWithSpend.reduce((sum, d) => sum + d.total, 0)
  const avgDaily = daysWithSpend.length > 0 ? totalSpend / daysWithSpend.length : 0
  const maxTotal = Math.max(...dailyTotals.map(d => d.total), 0.01)

  const selectedExpenses = selectedDay ? (byDay[selectedDay] ?? []) : []
  const selectedTotal = selectedExpenses.reduce((s, e) => s + Number(e.amount), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Resumo Diário</h1>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-1 py-1">
          <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-700 px-2 capitalize min-w-[140px] text-center">
            {formatMonthYear(year, month)}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && daysWithSpend.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total gasto</p>
            <p className="text-lg font-bold text-danger mt-1">{formatCurrency(totalSpend)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Média por dia</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(avgDaily)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Dias c/ gastos</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{daysWithSpend.length}</p>
          </div>
        </div>
      )}

      {loading && <div className="skeleton h-44 rounded-xl" />}
      {error && <div className="bg-danger-light text-danger-text text-sm px-4 py-3 rounded-xl">{error}</div>}

      {/* Bar chart */}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          {daysWithSpend.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Nenhum gasto registrado em {formatMonthYear(year, month)}.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto pb-1">
                <div className="flex items-end gap-0.5 min-w-0" style={{ minWidth: `${days.length * 22}px` }}>
                  {dailyTotals.map(d => {
                    const barPct = d.total > 0 ? Math.max((d.total / maxTotal) * 100, 8) : 0
                    const isHigh = d.total > 0 && avgDaily > 0 && d.total > avgDaily * 1.5
                    const isSelected = selectedDay === d.date

                    let barBg = 'bg-primary-400'
                    if (isHigh) barBg = 'bg-amber-400'
                    if (isSelected) barBg = 'bg-primary-600'
                    if (d.total === 0) barBg = 'bg-gray-100'

                    return (
                      <button
                        key={d.date}
                        onClick={() => setSelectedDay(isSelected ? null : d.date)}
                        className={`flex flex-col items-center gap-1 flex-1 min-w-[18px] transition-opacity ${d.isFuture ? 'opacity-30' : 'hover:opacity-80'}`}
                        title={`${formatDate(d.date)}: ${formatCurrency(d.total)}`}
                        disabled={d.isFuture}
                      >
                        <div className="w-full flex items-end" style={{ height: '72px' }}>
                          {d.total > 0 ? (
                            <div
                              className={`w-full rounded-t transition-all ${barBg} ${isSelected ? 'ring-2 ring-offset-1 ring-primary-400' : ''}`}
                              style={{ height: `${barPct}%` }}
                            />
                          ) : (
                            <div className={`w-full rounded-t ${barBg}`} style={{ height: '3px' }} />
                          )}
                        </div>
                        <span className={`text-[10px] leading-none ${isSelected ? 'font-bold text-primary-600' : d.isToday ? 'font-semibold text-primary-500' : 'text-gray-400'}`}>
                          {d.day}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-primary-400 inline-block" />
                  Normal
                </span>
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
                  Acima da média (1.5×)
                </span>
                {avgDaily > 0 && (
                  <span className="ml-auto text-xs text-gray-400">
                    Média: {formatCurrency(avgDaily)}/dia
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Selected day detail */}
      {selectedDay && (
        <div className="bg-white rounded-xl border border-primary-100 ring-1 ring-primary-50 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-900">{formatDate(selectedDay)}</p>
              {selectedExpenses.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">{selectedExpenses.length} saída(s)</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              {selectedExpenses.length > 0 && (
                <span className="text-sm font-bold text-danger">{formatCurrency(selectedTotal)}</span>
              )}
              <button
                onClick={() => setSelectedDay(null)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
          {selectedExpenses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              Nenhuma saída registrada neste dia.
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {selectedExpenses
                .slice()
                .sort((a, b) => Number(b.amount) - Number(a.amount))
                .map(e => (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3.5">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: e.category?.color ?? '#7C3AED' }}
                    >
                      {e.description[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{e.description}</p>
                      <p className="text-xs text-gray-400">
                        {e.category?.name ?? 'Sem categoria'}
                        {e.payment_method && ` · ${e.payment_method}`}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-danger shrink-0">
                      -{formatCurrency(Number(e.amount))}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Days list (when nothing selected and there are expenses) */}
      {!loading && !error && !selectedDay && daysWithSpend.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5 border-b border-gray-50">
            Dias com gastos
          </p>
          <div className="divide-y divide-gray-50">
            {daysWithSpend
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map(d => {
                const dayExpenses = byDay[d.date] ?? []
                const isHigh = avgDaily > 0 && d.total > avgDaily * 1.5
                return (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDay(d.date)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${d.isToday ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                      {d.day}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(d.date)}
                        {d.isToday && <span className="ml-2 text-xs font-normal text-primary-500">hoje</span>}
                      </p>
                      <p className="text-xs text-gray-400">{dayExpenses.length} saída(s)</p>
                    </div>
                    {isHigh && (
                      <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                        Alto
                      </span>
                    )}
                    <span className="text-sm font-semibold text-danger shrink-0">
                      -{formatCurrency(d.total)}
                    </span>
                  </button>
                )
              })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && expenses.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 shadow-sm text-center">
          <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-primary-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            Sem saídas em {formatMonthYear(year, month)}
          </h3>
          <p className="text-sm text-gray-500">
            Registre suas saídas para acompanhar os gastos dia a dia.
          </p>
        </div>
      )}
    </div>
  )
}
