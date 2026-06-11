import { useState } from 'react'
import { CalendarDays, Plus, Pencil, Trash2, PauseCircle, PlayCircle } from 'lucide-react'
import { useFixedBills } from '../hooks/useFixedBills'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ToastContainer, useToast } from '../components/ui/Toast'
import { FixedBillForm } from '../components/forms/FixedBillForm'
import { formatCurrency } from '../utils/currency'
import type { FixedBill } from '../types/supabase.types'
import type { CreateFixedBillDTO } from '../services/fixedBillsService'

const STATUS_STYLE: Record<FixedBill['status'], string> = {
  active:    'bg-success-light text-success-text',
  paused:    'bg-warning-light text-warning-text',
  cancelled: 'bg-gray-100 text-gray-400',
}
const STATUS_LABEL: Record<FixedBill['status'], string> = {
  active: 'Ativa', paused: 'Pausada', cancelled: 'Cancelada',
}

export function FixedBillsPage() {
  const { bills, totalActive, loading, error, create, update, remove, toggleStatus } = useFixedBills()
  const { toasts, show, remove: removeToast } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing]       = useState<FixedBill | null>(null)
  const [deleting, setDeleting]     = useState<FixedBill | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const active   = bills.filter(b => b.status === 'active')
  const inactive = bills.filter(b => b.status !== 'active')

  async function handleCreate(dto: CreateFixedBillDTO) {
    await create(dto)
    setIsFormOpen(false)
    show('Conta fixa cadastrada!')
  }

  async function handleUpdate(dto: CreateFixedBillDTO) {
    if (!editing) return
    await update(editing.id, dto)
    setEditing(null)
    show('Conta fixa atualizada!')
  }

  async function handleToggle(bill: FixedBill) {
    try {
      await toggleStatus(bill)
      show(bill.status === 'active' ? 'Conta pausada.' : 'Conta reativada!', bill.status === 'active' ? 'warning' : 'success')
    } catch {
      show('Erro ao alterar status.', 'error')
    }
  }

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await remove(deleting.id)
      show('Conta fixa excluída.', 'warning')
      setDeleting(null)
    } catch (e) {
      show(e instanceof Error ? e.message : 'Erro ao excluir.', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  function BillRow({ bill }: { bill: FixedBill }) {
    return (
      <div className={`flex items-center gap-3 px-4 py-3.5 group ${bill.status !== 'active' ? 'opacity-60' : ''}`}>
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: bill.category?.color ?? '#f59e0b' }}
        >
          {bill.description[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{bill.description}</p>
          <p className="text-xs text-gray-400">
            Dia {bill.due_day} · {bill.recurrence === 'monthly' ? 'Mensal' : 'Anual'}
            {bill.category && ` · ${bill.category.name}`}
          </p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLE[bill.status]}`}>
          {STATUS_LABEL[bill.status]}
        </span>
        <span className="text-sm font-semibold text-warning-text shrink-0">
          {formatCurrency(Number(bill.amount))}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {bill.status !== 'cancelled' && (
            <button
              onClick={() => handleToggle(bill)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              title={bill.status === 'active' ? 'Pausar' : 'Reativar'}
            >
              {bill.status === 'active'
                ? <PauseCircle className="w-3.5 h-3.5" />
                : <PlayCircle  className="w-3.5 h-3.5" />}
            </button>
          )}
          <button onClick={() => setEditing(bill)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setDeleting(bill)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contas Fixas</h1>
          {!loading && active.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">Total ativo: <span className="font-semibold text-warning-text">{formatCurrency(totalActive)}</span>/mês</p>
          )}
        </div>
        <button onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />Nova Conta Fixa
        </button>
      </div>

      {loading && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>}
      {error && <div className="bg-danger-light text-danger-text text-sm px-4 py-3 rounded-xl">{error}</div>}

      {!loading && !error && bills.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 shadow-sm text-center">
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="w-7 h-7 text-amber-500" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Nenhuma conta fixa cadastrada</h3>
          <p className="text-sm text-gray-500 mb-5">Cadastre contas recorrentes para planejar o mês com antecedência.</p>
          <button onClick={() => setIsFormOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors">
            Cadastrar conta fixa
          </button>
        </div>
      )}

      {!loading && active.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5 border-b border-gray-50">Ativas</p>
          <div className="divide-y divide-gray-50">{active.map(b => <BillRow key={b.id} bill={b} />)}</div>
        </div>
      )}

      {!loading && inactive.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5 border-b border-gray-50">Pausadas / Canceladas</p>
          <div className="divide-y divide-gray-50">{inactive.map(b => <BillRow key={b.id} bill={b} />)}</div>
        </div>
      )}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Nova Conta Fixa">
        <FixedBillForm onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />
      </Modal>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar Conta Fixa">
        {editing && <FixedBillForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Excluir conta fixa"
        message={`Excluir "${deleting?.description}"? Esta ação não pode ser desfeita.`}
        loading={deleteLoading}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
