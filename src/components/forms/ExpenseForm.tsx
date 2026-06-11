import { useState, type FormEvent } from 'react'
import { useCategories } from '../../hooks/useCategories'
import { todayISO } from '../../utils/date'
import type { Expense } from '../../types/supabase.types'
import type { CreateExpenseDTO } from '../../services/expensesService'

interface ExpenseFormProps {
  initial?: Partial<Expense>
  onSubmit: (data: CreateExpenseDTO) => Promise<void>
  onCancel: () => void
}

const PAYMENT_METHODS = [
  { value: '', label: 'Não informar' },
  { value: 'pix', label: 'Pix' },
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
  { value: 'cash', label: 'Dinheiro' },
  { value: 'other', label: 'Outro' },
] as const

export function ExpenseForm({ initial, onSubmit, onCancel }: ExpenseFormProps) {
  const { categories } = useCategories('expense')

  const [description, setDescription] = useState(initial?.description ?? '')
  const [amount, setAmount]           = useState(initial?.amount ? String(initial.amount) : '')
  const [date, setDate]               = useState(initial?.date ?? todayISO())
  const [categoryId, setCategoryId]   = useState(initial?.category_id ?? '')
  const [notes, setNotes]             = useState(initial?.notes ?? '')
  const [payment, setPayment]         = useState<string>(initial?.payment_method ?? '')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const parsedAmount = parseFloat(amount.replace(',', '.'))
    if (!description.trim()) { setError('A descrição é obrigatória.'); return }
    if (isNaN(parsedAmount) || parsedAmount <= 0) { setError('Informe um valor válido maior que zero.'); return }

    setLoading(true)
    try {
      await onSubmit({
        description: description.trim(),
        amount: parsedAmount,
        date,
        category_id: categoryId || null,
        notes: notes.trim() || null,
        payment_method: (payment as Expense['payment_method']) || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-danger-light text-danger-text text-sm px-3 py-2.5 rounded-lg">{error}</div>
      )}

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Almoço, Uber, Mercado..."
          required
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Valor e Data — linha */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Valor</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Data</label>
          <input
            type="date"
            required
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categoria */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        >
          <option value="">Sem categoria</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Forma de pagamento */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Forma de pagamento</label>
        <select
          value={payment}
          onChange={e => setPayment(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        >
          {PAYMENT_METHODS.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      {/* Observação */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Observação <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          placeholder="Detalhes adicionais..."
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 rounded-lg transition-colors flex items-center justify-center gap-2">
          {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {initial?.id ? 'Salvar' : 'Registrar'}
        </button>
      </div>
    </form>
  )
}
