import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import type { Produto } from '../types'
import { useAuth } from '../context/AuthContext'
import { useCarrinho } from '../context/CarrinhoContext'
import { adicionarItem } from '../api/carrinho'

interface ProdutoCardProps {
  produto: Produto
}

export function ProdutoCard({ produto }: ProdutoCardProps) {
  const { usuario, isCliente } = useAuth()
  const { recarregarCarrinho } = useCarrinho()
  const [loading, setLoading] = useState(false)

  const semEstoque = (produto.estoque?.quantidade ?? 0) === 0
  const ehVendedorDoProduto = usuario?.id === produto.vendedor?.id
  const mostrarBotao = isCliente() && !ehVendedorDoProduto

  async function adicionarAoCarrinho() {
    if (!usuario) return
    setLoading(true)
    try {
      await adicionarItem(usuario.id, produto.id, 1)
      await recarregarCarrinho()
      toast.success('Produto adicionado ao carrinho!')
    } catch {
      toast.error('Erro ao adicionar ao carrinho.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:scale-[1.02] transition-transform duration-200 flex flex-col">
      <Link to={`/produtos/${produto.id}`}>
        <div className="h-48 bg-gray-100 overflow-hidden">
          {produto.imagemUrl ? (
            <img
              src={produto.imagemUrl}
              alt={produto.nome}
              className="w-full h-full object-cover hover:opacity-90 transition-opacity"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Sem+Imagem'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              Sem imagem
            </div>
          )}
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link to={`/produtos/${produto.id}`}>
          <h3 className="font-semibold text-gray-800 hover:text-indigo-600 transition-colors line-clamp-2 mb-1">
            {produto.nome}
          </h3>
        </Link>

        {produto.categoria && (
          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full w-fit mb-2">
            {produto.categoria.nome}
          </span>
        )}

        <p className="text-sm text-gray-500 mb-3">
          por {produto.vendedor?.nomeLoja ?? produto.vendedor?.nome}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-xl font-bold text-indigo-600">
            {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>

          {mostrarBotao && (
            <button
              onClick={adicionarAoCarrinho}
              disabled={semEstoque || loading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm px-3 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? '...' : semEstoque ? 'Sem estoque' : '+ Carrinho'}
            </button>
          )}
        </div>

        {semEstoque && (
          <p className="text-xs text-red-500 mt-1">Produto indisponível</p>
        )}
      </div>
    </div>
  )
}
