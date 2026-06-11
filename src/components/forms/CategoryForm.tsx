import { useState, type FormEvent } from 'react'
import type { Category } from '../../types/supabase.types'
import type { CreateCategoryDTO } from '../../services/categoriesService'

const PRESET_COLORS = [
  '#7c3aed', '#2563eb', '#059669', '#d97706',
  '#dc2626', '#db2777', '#0891b2', '#4f46e5',
  '#16a34a', '#ea580c', '#9333ea', '#475569',
]

const PRESET_ICONS = [
  'ShoppingBag', 'UtensilsCrossed', 'Car', 'Home', 'Heart',
  'Smile', 'BookOpen', 'CreditCard', 'Laptop', 'Briefcase',
  'Zap', 'Music', 'Gamepad2', 'Plane', 'Gift', 'MoreHorizontal',
]

interface CategoryFormProps {
  initial?: Partial<Category>
  onSubmit: (data: CreateCategoryDTO) => Promise<void>
  onCancel: () => void
}

export function CategoryForm({ initial, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName]   = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? '#7c3aed')
  const [icon, setIcon]   = useState(initial?.icon ?? 'MoreHorizontal')
  const [type, setType]   = useState<Category['type']>(initial?.type ?? 'expense')
  const [limit, setLimit] = useState(initial?.monthly_limit ? String(initial.monthly_limit) : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) { setError('O nome é obrigatório.'); return }
    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        color,
        icon,
        type,
        monthly_limit: limit ? parseFloat(limit.replace(',', '.')) : null,
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

      {/* Nome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Alimentação"
          required
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Tipo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo</label>
        <div className="grid grid-cols-3 gap-2">
          {([['expense', 'Saída'], ['income', 'Entrada'], ['both', 'Ambos']] as const).map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setType(v)}
              className={`py-2 text-sm font-medium rounded-lg border transition-colors ${
                type === v
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Cor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Cor</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={e => setColor(e.target.value)}
            className="w-7 h-7 rounded-full border-2 border-gray-200 cursor-pointer"
            title="Cor personalizada"
          />
        </div>
      </div>

      {/* Ícone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Ícone</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_ICONS.map(i => (
            <button
              key={i}
              type="button"
              onClick={() => setIcon(i)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                icon === i
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Limite mensal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Limite mensal <span className="text-gray-400 font-normal">(opcional)</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={limit}
            onChange={e => setLimit(e.target.value)}
            placeholder="0,00"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Prévia */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: color }}>
          {name ? name[0].toUpperCase() : '?'}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{name || 'Nome da categoria'}</p>
          <p className="text-xs text-gray-400">{type === 'expense' ? 'Saída' : type === 'income' ? 'Entrada' : 'Entrada e Saída'}{limit ? ` · Limite R$ ${limit}` : ''}</p>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {initial?.id ? 'Salvar' : 'Criar'}
        </button>
      </div>
    </form>
  )
}
