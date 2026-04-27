import api from './axios'
import type { Pedido, StatusPedido } from '../types'

export interface EnderecoEntregaData {
  rua: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export interface CupomAplicadoData {
  codigo: string
  produtoId: number
}

export const criarPedido = (clienteId: number, enderecoEntrega?: EnderecoEntregaData, cupomAplicado?: CupomAplicadoData) =>
  api.post<Pedido>(`/api/pedidos/cliente/${clienteId}`, {
    ...(enderecoEntrega ? { enderecoEntrega } : {}),
    ...(cupomAplicado ? { cupomAplicado } : {}),
  })

export const listarPedidos = () =>
  api.get<Pedido[]>('/api/pedidos')

export const buscarPedido = (id: number) =>
  api.get<Pedido>(`/api/pedidos/${id}`)

export const listarPedidosPorCliente = (clienteId: number) =>
  api.get<Pedido[]>(`/api/pedidos/cliente/${clienteId}`)

export const listarPedidosPorVendedor = (vendedorId: number) =>
  api.get<Pedido[]>(`/api/pedidos/vendedor/${vendedorId}`)

export const atualizarStatusPedido = (id: number, status: StatusPedido) =>
  api.patch(`/api/pedidos/${id}/status`, null, { params: { status } })

export const cancelarPedido = (id: number) =>
  api.patch(`/api/pedidos/${id}/cancelar`)
