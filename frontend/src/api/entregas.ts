import api from './axios'
import type { Entrega } from '../types'

export const buscarEntregaPorPedido = (pedidoId: number) =>
  api.get<Entrega | null>(`/api/entregas/pedido/${pedidoId}`).then((res) => ({
    ...res,
    data: res.status === 204 ? null : res.data,
  }))

export const atualizarStatusEntrega = (id: number, status: string) =>
  api.patch(`/api/entregas/${id}/status`, null, { params: { status } })
