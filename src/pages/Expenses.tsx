import { useState } from 'react'
import { TrendingDown, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { useExpenses } from '../hooks/useExpenses'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ToastContainer, useToast } from '../components/ui/Toast'
import { ExpenseForm } from '../components/forms/ExpenseForm'
import { formatCurrency } from '../utils/currency'
import { formatDate, formatMonthYear } from '../utils/date'
import type { Expense } from '../types/supabase.types'
import type { CreateExpenseDTO } from '../services/expensesService'

export function ExpensesPage() {
  const now = new Date()
  const [year, setYear]   = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const { expenses, total, loading, error, create, update, remove } = useExpenses(year, month)

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }
  const { toasts, show, remove: removeToast } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing]       = useState<Expense | null>(null)
  const [deleting, setDeleting]     = useState<Expense | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleCreate(dto: CreateExpenseDTO) {
    await create(dto)
    setIsFormOpen(false)
    show('Saída registrada!')
  }

  async function handleUpdate(dto: CreateExpenseDTO) {
    if (!editing) return
    await update(editing.id, dto)
    setEditing(null)
    show('Saída atualizada!')
  }

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await remove(deleting.id)
      show('Saída excluída.', 'warning')
      setDeleting(null)
    } catch (e) {
      show(e instanceof Error ? e.message : 'Erro ao excluir.', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saídas</h1>
          {!loading && expenses.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">Total: <span className="font-semibold text-danger">{formatCurrency(total)}</span></p>
          )}
        </div>
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
            <Plus className="w-4 h-4" />Nova Saída
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      )}

      {error && (
        <div className="bg-danger-light text-danger-text text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      {/* Vazio */}
      {!loading && !error && expenses.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 shadow-sm text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingDown className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Nenhuma saída este mês</h3>
          <p className="text-sm text-gray-500 mb-5">Que dia feliz! Registre uma saída para começar o controle.</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Registrar saída
          </button>
        </div>
      )}

      {/* Lista */}
      {!loading && expenses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {expenses.map(expense => (
            <div key={expense.id} className="flex items-center gap-3 px-4 py-3.5 group">
              {/* Cor da categoria */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ backgroundColor: expense.category?.color ?? '#9ca3af' }}
              >
                {expense.category ? expense.category.name[0].toUpperCase() : '?'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{expense.description}</p>
                <p className="text-xs text-gray-400">
                  {formatDate(expense.date)}
                  {expense.category && ` · ${expense.category.name}`}
                  {expense.payment_method && ` · ${expense.payment_method}`}
                </p>
              </div>

              {/* Valor */}
              <span className="text-sm font-semibold text-danger shrink-0">
                -{formatCurrency(Number(expense.amount))}
              </span>

              {/* Ações */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => setEditing(expense)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleting(expense)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modais */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Nova Saída">
        <ExpenseForm onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar Saída">
        {editing && (
          <ExpenseForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Excluir saída"
        message={`Excluir "${deleting?.description}" de ${formatCurrency(Number(deleting?.amount))}? Esta ação não pode ser desfeita.`}
        loading={deleteLoading}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
