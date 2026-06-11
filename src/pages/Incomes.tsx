import { useState } from 'react'
import { TrendingUp, Plus, Pencil, Trash2, CheckCircle, ChevronLeft, ChevronRight, ArrowRight, Clock } from 'lucide-react'
import { useIncomes } from '../hooks/useIncomes'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ToastContainer, useToast } from '../components/ui/Toast'
import { IncomeForm } from '../components/forms/IncomeForm'
import { formatCurrency } from '../utils/currency'
import { formatMonthYear, monthYearFromDate, currentMonthISO, todayISO } from '../utils/date'
import type { Income } from '../types/supabase.types'
import type { CreateIncomeDTO } from '../services/incomesService'

const STATUS_STYLE: Record<Income['status'], string> = {
  expected:  'bg-info-light text-info-text',
  received:  'bg-success-light text-success-text',
  cancelled: 'bg-gray-100 text-gray-400',
}
const STATUS_LABEL: Record<Income['status'], string> = {
  expected:  'Previsto',
  received:  'Recebido',
  cancelled: 'Cancelado',
}

export function IncomesPage() {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const {
    incomes,
    allExpected,
    totalReceived,
    totalExpected,
    loading,
    error,
    create,
    receive,
    update,
    remove,
    carryOver,
  } = useIncomes(year, month)

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const { toasts, show, remove: removeToast } = useToast()

  const [isFormOpen, setIsFormOpen]         = useState(false)
  const [editing, setEditing]               = useState<Income | null>(null)
  const [deleting, setDeleting]             = useState<Income | null>(null)
  const [receiving, setReceiving]           = useState<Income | null>(null)
  const [receiveLoading, setReceiveLoading] = useState(false)
  const [deleteLoading, setDeleteLoading]   = useState(false)
  const [isCarryOverOpen, setIsCarryOverOpen]   = useState(false)
  const [carryOverLoading, setCarryOverLoading] = useState(false)

  const currentMonth = currentMonthISO()

  // Entradas em atraso (mês previsto já passou)
  const overdueExpected = allExpected.filter(
    i => i.expected_date.substring(0, 7) < currentMonth
  )

  // Entradas do mês visualizado (recebidas + canceladas)
  const received  = incomes.filter(i => i.status === 'received')
  const cancelled = incomes.filter(i => i.status === 'cancelled')

  const hasAnything = allExpected.length > 0 || incomes.length > 0

  async function handleCarryOver() {
    setCarryOverLoading(true)
    try {
      const count = await carryOver()
      setIsCarryOverOpen(false)
      show(`${count} entrada(s) atrasada(s) movida(s) para este mês!`)
    } catch (e) {
      show(e instanceof Error ? e.message : 'Erro ao mover entradas.', 'error')
    } finally {
      setCarryOverLoading(false)
    }
  }

  async function handleCreate(dto: CreateIncomeDTO) {
    await create(dto)
    setIsFormOpen(false)
    show('Entrada cadastrada!')
  }

  async function handleUpdate(dto: CreateIncomeDTO) {
    if (!editing) return
    await update(editing.id, dto)
    setEditing(null)
    show('Entrada atualizada!')
  }

  async function handleReceive() {
    if (!receiving) return
    setReceiveLoading(true)
    try {
      await receive(receiving.id, todayISO())
      show('Entrada marcada como recebida!')
      setReceiving(null)
    } catch (e) {
      show(e instanceof Error ? e.message : 'Erro.', 'error')
    } finally {
      setReceiveLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await remove(deleting.id)
      show('Entrada excluída.', 'warning')
      setDeleting(null)
    } catch (e) {
      show(e instanceof Error ? e.message : 'Erro ao excluir.', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  function IncomeRow({ income, showOverdue }: { income: Income; showOverdue?: boolean }) {
    const isOverdue = showOverdue && income.expected_date.substring(0, 7) < currentMonth
    return (
      <div className="flex items-center gap-3 px-4 py-3.5 group">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: income.category?.color ?? '#10b981' }}
        >
          {income.category ? income.category.name[0].toUpperCase() : 'E'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{income.description}</p>
          <p className="text-xs text-gray-400">
            Prevista para {monthYearFromDate(income.expected_date)}
            {income.received_date && ' · Recebido'}
          </p>
        </div>
        {isOverdue && (
          <span className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
            <Clock className="w-3 h-3" />
            Atrasada
          </span>
        )}
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[income.status]}`}>
          {STATUS_LABEL[income.status]}
        </span>
        <span className="text-sm font-semibold text-success shrink-0">
          +{formatCurrency(Number(income.amount))}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {income.status === 'expected' && (
            <button
              onClick={() => setReceiving(income)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-green-50 hover:text-green-500 transition-colors"
              title="Marcar como recebido"
            >
              <CheckCircle className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setEditing(income)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleting(income)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Entradas</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-1 py-1">
            <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 px-2 capitalize min-w-[130px] text-center">
              {formatMonthYear(year, month)}
            </span>
            <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-gray-100 transition-colors text-gray-500">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />Nova Entrada
          </button>
        </div>
      </div>

      {/* Totais */}
      {!loading && hasAnything && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Já recebido</p>
            <p className="text-sm text-gray-400 mt-0.5">{formatMonthYear(year, month)}</p>
            <p className="text-xl font-bold text-success mt-1">{formatCurrency(totalReceived)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">A receber</p>
            <p className="text-sm text-gray-400 mt-0.5">Todas as previstas</p>
            <p className="text-xl font-bold text-info mt-1">{formatCurrency(totalExpected)}</p>
          </div>
        </div>
      )}

      {loading && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>}
      {error && <div className="bg-danger-light text-danger-text text-sm px-4 py-3 rounded-xl">{error}</div>}

      {!loading && !error && !hasAnything && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 shadow-sm text-center">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-7 h-7 text-green-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Nenhuma entrada cadastrada</h3>
          <p className="text-sm text-gray-500 mb-5">Registre entradas previstas para controlar o que está por vir.</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Cadastrar primeira entrada
          </button>
        </div>
      )}

      {/* A Receber — GLOBAL (todas as entradas previstas, de qualquer mês) */}
      {!loading && allExpected.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              A Receber ({allExpected.length})
              {overdueExpected.length > 0 && (
                <span className="ml-2 text-amber-600 normal-case font-medium">
                  · {overdueExpected.length} atrasada{overdueExpected.length > 1 ? 's' : ''}
                </span>
              )}
            </p>
            {overdueExpected.length > 0 && (
              <button
                onClick={() => setIsCarryOverOpen(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 px-2.5 py-1.5 rounded-lg transition-colors"
                title="Mover entradas atrasadas para o mês atual"
              >
                <ArrowRight className="w-3 h-3" />
                Mover atrasadas para este mês
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-50">
            {allExpected.map(i => <IncomeRow key={i.id} income={i} showOverdue />)}
          </div>
        </div>
      )}

      {/* Recebido — mês selecionado */}
      {!loading && received.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5 border-b border-gray-50">
            Recebido em {formatMonthYear(year, month)}
          </p>
          <div className="divide-y divide-gray-50">
            {received.map(i => <IncomeRow key={i.id} income={i} />)}
          </div>
        </div>
      )}

      {/* Cancelado — mês selecionado */}
      {!loading && cancelled.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm opacity-60">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5 border-b border-gray-50">
            Cancelado em {formatMonthYear(year, month)}
          </p>
          <div className="divide-y divide-gray-50">
            {cancelled.map(i => <IncomeRow key={i.id} income={i} />)}
          </div>
        </div>
      )}

      {/* Modais */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Nova Entrada">
        <IncomeForm onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />
      </Modal>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar Entrada">
        {editing && <IncomeForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        isOpen={isCarryOverOpen}
        onClose={() => setIsCarryOverOpen(false)}
        onConfirm={handleCarryOver}
        title="Mover entradas atrasadas"
        message={`${overdueExpected.length} entrada(s) com mês previsto já passado serão movidas para ${formatMonthYear(now.getFullYear(), now.getMonth() + 1)}. As datas originais serão atualizadas para este mês.`}
        confirmLabel="Mover atrasadas"
        loading={carryOverLoading}
      />
      <ConfirmDialog
        isOpen={!!receiving}
        onClose={() => setReceiving(null)}
        onConfirm={handleReceive}
        title="Marcar como recebido"
        message={`Confirmar recebimento de "${receiving?.description}" (${formatCurrency(Number(receiving?.amount))})?`}
        confirmLabel="Confirmar recebimento"
        loading={receiveLoading}
      />
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Excluir entrada"
        message={`Excluir "${deleting?.description}"? Esta ação não pode ser desfeita.`}
        loading={deleteLoading}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
