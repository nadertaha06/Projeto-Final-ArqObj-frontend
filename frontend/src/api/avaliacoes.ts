import api from './axios'
import type { Avaliacao } from '../types'

export const listarAvaliacoesPorProduto = (produtoId: number) =>
  api.get<Avaliacao[]>(`/api/avaliacoes/produto/${produtoId}`)

export const criarAvaliacao = (
  nota: number,
  comentario: string,
  clienteId: number,
  produtoId: number,
  pedidoId: number
) =>
  api.post<Avaliacao>(
    '/api/avaliacoes',
    { nota, comentario, cliente: { id: clienteId }, produto: { id: produtoId } },
    { params: { pedidoId } }
  )
