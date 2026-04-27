import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { buscarCarrinho } from '../api/carrinho'
import type { Carrinho } from '../types'
import { useAuth } from './AuthContext'

interface CarrinhoContextData {
  carrinho: Carrinho | null
  totalItens: number
  recarregarCarrinho: () => Promise<void>
}

const CarrinhoContext = createContext<CarrinhoContextData>({} as CarrinhoContextData)

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const { usuario, isCliente } = useAuth()
  const [carrinho, setCarrinho] = useState<Carrinho | null>(null)

  const recarregarCarrinho = async () => {
    if (!usuario || !isCliente()) return
    try {
      const { data } = await buscarCarrinho(usuario.id)
      setCarrinho(data)
    } catch {
      setCarrinho(null)
    }
  }

  useEffect(() => {
    if (usuario && isCliente()) {
      recarregarCarrinho()
    } else {
      setCarrinho(null)
    }
  }, [usuario])

  const totalItens = carrinho?.itens?.reduce((acc, item) => acc + item.quantidade, 0) ?? 0

  return (
    <CarrinhoContext.Provider value={{ carrinho, totalItens, recarregarCarrinho }}>
      {children}
    </CarrinhoContext.Provider>
  )
}

export function useCarrinho() {
  return useContext(CarrinhoContext)
}
