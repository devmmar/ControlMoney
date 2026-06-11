import { useState, type FormEvent } from 'react'
import { useCategories } from '../../hooks/useCategories'
import type { FixedBill } from '../../types/supabase.types'
import type { CreateFixedBillDTO } from '../../services/fixedBillsService'

interface FixedBillFormProps {
  initial?: Partial<FixedBill>
  onSubmit: (data: CreateFixedBillDTO) => Promise<void>
  onCancel: () => void
}

export function FixedBillForm({ initial, onSubmit, onCancel }: FixedBillFormProps) {
  const { categories } = useCategories('expense')

  const [description, setDescription] = useState(initial?.description ?? '')
  const [amount, setAmount]           = useState(initial?.amount ? String(initial.amount) : '')
  const [dueDay, setDueDay]           = useState(initial?.due_day ? String(initial.due_day) : '')
  const [recurrence, setRecurrence]   = useState<FixedBill['recurrence']>(initial?.recurrence ?? 'monthly')
  const [categoryId, setCategoryId]   = useState(initial?.category_id ?? '')
  const [notes, setNotes]             = useState(initial?.notes ?? '')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const parsedAmount = parseFloat(amount.replace(',', '.'))
    const parsedDay = parseInt(dueDay)
    if (!description.trim()) { setError('A descrição é obrigatória.'); return }
    if (isNaN(parsedAmount) || parsedAmount <= 0) { setError('Informe um valor válido.'); return }
    if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31) { setError('Dia de vencimento inválido (1-31).'); return }

    setLoading(true)
    try {
      await onSubmit({
        description: description.trim(),
        amount: parsedAmount,
        due_day: parsedDay,
        recurrence,
        category_id: categoryId || null,
        notes: notes.trim() || null,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-danger-light text-danger-text text-sm px-3 py-2.5 rounded-lg">{error}</div>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
        <input
          value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Aluguel, Netflix, Academia..."
          required
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Valor</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
            <input type="number" min="0.01" step="0.01" required
              value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Dia de vencimento</label>
          <input type="number" min="1" max="31" required
            value={dueDay} onChange={e => setDueDay(e.target.value)} placeholder="Ex: 5, 10, 15..."
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Recorrência</label>
        <div className="grid grid-cols-2 gap-2">
          {([['monthly', 'Mensal'], ['annual', 'Anual']] as const).map(([v, l]) => (
            <button key={v} type="button" onClick={() => setRecurrence(v)}
              className={`py-2 text-sm font-medium rounded-lg border transition-colors ${recurrence === v ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white">
          <option value="">Sem categoria</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Observação <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 rounded-lg transition-colors flex items-center justify-center gap-2">
          {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {initial?.id ? 'Salvar' : 'Cadastrar'}
        </button>
      </div>
    </form>
  )
}
