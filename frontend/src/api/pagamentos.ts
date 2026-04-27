import api from './axios'

export interface PagamentoPixData {
  tipo: 'PagamentoPix'
  chavePix: string
}

export interface PagamentoCartaoData {
  tipo: 'PagamentoCartao'
  ultimosQuatroDigitos: string
  nomeTitular: string
  parcelas: number
}

export interface PagamentoBoletoData {
  tipo: 'PagamentoBoleto'
}

export type PagamentoData = PagamentoPixData | PagamentoCartaoData | PagamentoBoletoData

export const processarPagamento = (pedidoId: number, data: PagamentoData) =>
  api.post(`/api/pagamentos/pedido/${pedidoId}`, data)
