import { useState } from 'react'
import { Tag, Plus, Pencil, Trash2 } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ToastContainer, useToast } from '../components/ui/Toast'
import { CategoryForm } from '../components/forms/CategoryForm'
import { formatCurrency } from '../utils/currency'
import type { Category } from '../types/supabase.types'
import type { CreateCategoryDTO } from '../services/categoriesService'

const TYPE_LABEL: Record<Category['type'], string> = {
  expense: 'Saída',
  income: 'Entrada',
  both: 'Ambos',
}

export function CategoriesPage() {
  const { categories, loading, error, create, update, remove } = useCategories()
  const { toasts, show, remove: removeToast } = useToast()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing]       = useState<Category | null>(null)
  const [deleting, setDeleting]     = useState<Category | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  async function handleCreate(dto: CreateCategoryDTO) {
    await create(dto)
    setIsFormOpen(false)
    show('Categoria criada com sucesso!')
  }

  async function handleUpdate(dto: CreateCategoryDTO) {
    if (!editing) return
    await update(editing.id, dto)
    setEditing(null)
    show('Categoria atualizada!')
  }

  async function handleDelete() {
    if (!deleting) return
    setDeleteLoading(true)
    try {
      await remove(deleting.id)
      show('Categoria excluída.', 'warning')
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      {/* Estados */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-danger-light text-danger-text text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {!loading && !error && categories.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-10 shadow-sm text-center">
          <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag className="w-7 h-7 text-primary-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">Nenhuma categoria criada</h3>
          <p className="text-sm text-gray-500 mb-5">
            Categorias ajudam a organizar seus gastos e gerar relatórios mais úteis.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
          >
            Criar primeira categoria
          </button>
        </div>
      )}

      {!loading && categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-3 group"
            >
              {/* Cor */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                style={{ backgroundColor: cat.color }}
              >
                {cat.name[0].toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{cat.name}</p>
                <p className="text-xs text-gray-400">
                  {TYPE_LABEL[cat.type]}
                  {cat.monthly_limit && ` · Limite ${formatCurrency(cat.monthly_limit)}`}
                </p>
              </div>

              {/* Ações */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditing(cat)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleting(cat)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal criar */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Nova Categoria">
        <CategoryForm onSubmit={handleCreate} onCancel={() => setIsFormOpen(false)} />
      </Modal>

      {/* Modal editar */}
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Editar Categoria">
        {editing && (
          <CategoryForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>

      {/* Dialog excluir */}
      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Excluir categoria"
        message={`Tem certeza que deseja excluir "${deleting?.name}"? As saídas e entradas vinculadas a ela perderão a categoria, mas não serão excluídas.`}
        loading={deleteLoading}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
