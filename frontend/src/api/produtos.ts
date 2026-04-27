import api from './axios'
import type { Produto } from '../types'

export interface CreateProdutoData {
  nome: string
  descricao: string
  preco: number
  imagemUrl: string
  categoria: { id: number }
  vendedor: { id: number }
}

export const listarProdutos = (nome?: string) =>
  api.get<Produto[]>('/api/produtos', { params: nome ? { nome } : {} })

export const buscarProduto = (id: number) =>
  api.get<Produto>(`/api/produtos/${id}`)

export const buscarProdutosPorVendedor = (vendedorId: number) =>
  api.get<Produto[]>(`/api/produtos/vendedor/${vendedorId}`)

export const buscarProdutosPorCategoria = (categoriaId: number) =>
  api.get<Produto[]>(`/api/produtos/categoria/${categoriaId}`)

export const criarProduto = (data: CreateProdutoData) =>
  api.post<Produto>('/api/produtos', data)

export const atualizarProduto = (id: number, data: Partial<CreateProdutoData>) =>
  api.put<Produto>(`/api/produtos/${id}`, data)

export const atualizarStatusProduto = (id: number, ativo: boolean) =>
  api.patch<Produto>(`/api/produtos/${id}/ativo`, null, { params: { ativo } })

export const deletarProduto = (id: number) =>
  api.delete(`/api/produtos/${id}`)
