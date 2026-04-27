import api from './axios'
import type { Cupom } from '../types'

export interface CriarCupomData {
  codigo: string
  desconto: number
  dataValidade: string
  usoMaximo: number
  produtoId: number
  vendedorId: number
}

export const validarCupom = (codigo: string, produtoId: number) =>
  api.post<Cupom>('/api/cupons/validar', null, { params: { codigo, produtoId } })

export const consumirCupom = (codigo: string, produtoId: number) =>
  api.post<Cupom>('/api/cupons/consumir', null, { params: { codigo, produtoId } })

export const criarCupom = (data: CriarCupomData) =>
  api.post<Cupom>('/api/cupons', data)

export const listarCuponsPorVendedor = (vendedorId: number) =>
  api.get<Cupom[]>(`/api/cupons/vendedor/${vendedorId}`)
