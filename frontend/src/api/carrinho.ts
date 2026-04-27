import api from './axios'
import type { Carrinho } from '../types'

export const buscarCarrinho = (clienteId: number) =>
  api.get<Carrinho>(`/api/carrinho/${clienteId}`)

export const adicionarItem = (clienteId: number, produtoId: number, quantidade: number) =>
  api.post(`/api/carrinho/${clienteId}/itens`, null, {
    params: { produtoId, quantidade },
  })

export const removerItem = (clienteId: number, produtoId: number) =>
  api.delete(`/api/carrinho/${clienteId}/itens/${produtoId}`)

export const limparCarrinho = (clienteId: number) =>
  api.delete(`/api/carrinho/${clienteId}/limpar`)
