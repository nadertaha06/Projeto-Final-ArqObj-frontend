import api from './axios'

export const criarEstoque = (produtoId: number, quantidade: number, quantidadeMinima: number) =>
  api.post('/api/estoques', { produto: { id: produtoId }, quantidade, quantidadeMinima })
