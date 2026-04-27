import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { removerItem, adicionarItem } from '../api/carrinho'
import { useAuth } from '../context/AuthContext'
import { useCarrinho } from '../context/CarrinhoContext'
import { EmptyState } from '../components/EmptyState'
import { LoadingSpinner } from '../components/LoadingSpinner'

export function CarrinhoPage() {
  const { usuario } = useAuth()
  const { carrinho, recarregarCarrinho } = useCarrinho()
  const navigate = useNavigate()
  const [atualizando, setAtualizando] = useState<number | null>(null)

  if (!carrinho) return <LoadingSpinner />

  const itens = carrinho.itens ?? []
  const total = itens.reduce((s, i) => s + i.produto.preco * i.quantidade, 0)

  async function handleRemover(produtoId: number) {
    if (!usuario) return
    try {
      await removerItem(usuario.id, produtoId)
      await recarregarCarrinho()
      toast.success('Item removido.')
    } catch {
      toast.error('Erro ao remover item.')
    }
  }

  async function handleQuantidade(produtoId: number, novaQtd: number) {
    if (!usuario || novaQtd < 1) return
    setAtualizando(produtoId)
    try {
      await removerItem(usuario.id, produtoId)
      await adicionarItem(usuario.id, produtoId, novaQtd)
      await recarregarCarrinho()
    } catch {
      toast.error('Erro ao atualizar quantidade.')
    } finally {
      setAtualizando(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Meu Carrinho</h1>

        {itens.length === 0 ? (
          <EmptyState message="Seu carrinho está vazio." icon="🛒" />
        ) : (
          <div className="space-y-4">
            {/* Tabela */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Produto</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Preço Unit.</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Qtd</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Subtotal</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {itens.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.produto.imagemUrl || 'https://placehold.co/64x64?text=?'}
                            alt={item.produto.nome}
                            className="w-14 h-14 rounded-lg object-cover bg-gray-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=?'
                            }}
                          />
                          <span className="font-medium text-gray-800">{item.produto.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center text-gray-600">
                        {item.produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          min={1}
                          max={item.produto.estoque?.quantidade ?? 99}
                          value={atualizando === item.produto.id ? '...' : item.quantidade}
                          disabled={atualizando === item.produto.id}
                          onChange={(e) => handleQuantidade(item.produto.id, Number(e.target.value))}
                          className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-4 text-center font-semibold text-indigo-600">
                        {(item.produto.preco * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleRemover(item.produto.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Remover"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Rodapé */}
            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-2xl font-bold text-gray-800">
                Total:{' '}
                <span className="text-indigo-600">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Finalizar Pedido →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
