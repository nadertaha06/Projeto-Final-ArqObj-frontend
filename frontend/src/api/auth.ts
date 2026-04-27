import api from './axios'
import type { LoginResponse } from '../types'

export interface RegisterClienteData {
  nome: string
  email: string
  senha: string
  cpf: string
  telefone: string
}

export interface RegisterVendedorData extends RegisterClienteData {
  nomeLoja: string
}

export const login = (email: string, senha: string) =>
  api.post<LoginResponse>('/api/auth/login', { email, senha })

export const registerCliente = (data: RegisterClienteData) =>
  api.post('/api/auth/register/cliente', data)

export const registerVendedor = (data: RegisterVendedorData) =>
  api.post('/api/auth/register/vendedor', data)
