import api from './axios'
import type { Endereco } from '../types'

export interface ClienteProfile {
  id: number
  nome: string
  email: string
  cpf: string
  telefone?: string
  enderecos: Endereco[]
}

export const buscarClientePorId = (id: number) =>
  api.get<ClienteProfile>(`/api/clientes/${id}`)
