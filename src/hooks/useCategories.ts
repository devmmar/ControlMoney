import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CreateCategoryDTO,
  type UpdateCategoryDTO,
} from '../services/categoriesService'
import type { Category } from '../types/supabase.types'

export function useCategories(type?: Category['type']) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await getCategories(user.id, type)
      setCategories(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar categorias.')
    } finally {
      setLoading(false)
    }
  }, [user, type])

  useEffect(() => { fetch() }, [fetch])

  async function create(dto: CreateCategoryDTO): Promise<void> {
    if (!user) return
    const created = await createCategory(user.id, dto)
    setCategories(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
  }

  async function update(id: string, dto: UpdateCategoryDTO): Promise<void> {
    const updated = await updateCategory(id, dto)
    setCategories(prev => prev.map(c => c.id === id ? updated : c))
  }

  async function remove(id: string): Promise<void> {
    await deleteCategory(id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  return { categories, loading, error, refetch: fetch, create, update, remove }
}
