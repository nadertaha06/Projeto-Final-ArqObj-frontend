import api from './axios'
import type { Categoria } from '../types'

export const listarCategorias = () =>
  api.get<Categoria[]>('/api/categorias')

export const criarCategoria = (nome: string, descricao: string) =>
  api.post<Categoria>('/api/categorias', { nome, descricao })
