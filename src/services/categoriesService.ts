import { supabase } from '../lib/supabaseClient'
import type { Category } from '../types/supabase.types'

export type CreateCategoryDTO = Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type UpdateCategoryDTO = Partial<CreateCategoryDTO>

export async function getCategories(userId: string, type?: Category['type']): Promise<Category[]> {
  let query = supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name')

  if (type && type !== 'both') {
    query = query.in('type', [type, 'both'])
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createCategory(userId: string, dto: CreateCategoryDTO): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ ...dto, user_id: userId })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('Já existe uma categoria com esse nome.')
    throw new Error(error.message)
  }
  return data
}

export async function updateCategory(id: string, dto: UpdateCategoryDTO): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(dto)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('Já existe uma categoria com esse nome.')
    throw new Error(error.message)
  }
  return data
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
