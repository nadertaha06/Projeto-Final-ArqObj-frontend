import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { buscarProdutosPorVendedor, deletarProduto } from '../../api/produtos'
import type { Produto } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { EmptyState } from '../../components/EmptyState'
import { ConfirmDialog } from '../../components/ConfirmDialog'

export function MeusProdutosPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [deletando, setDeletando] = useState<number | null>(null)
  const [produtoParaExcluir, setProdutoParaExcluir] = useState<Produto | null>(null)

  async function carregar() {
    if (!usuario) return
    setLoading(true)
    buscarProdutosPorVendedor(usuario.id)
      .then((r) => setProdutos(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [usuario])

  async function handleDeletar(produto: Produto) {
    setDeletando(produto.id)
    try {
      await deletarProduto(produto.id)
      toast.success('Produto excluído.')
      setProdutos((prev) => prev.filter((p) => p.id !== produto.id))
    } catch {
      toast.error('Erro ao excluir produto.')
    } finally {
      setDeletando(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Meus Produtos</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/vendedor/cupons')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
            >
              Gerenciar Cupons
            </button>
            <button
              onClick={() => navigate('/vendedor/produtos/novo')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <span>+</span> Novo Produto
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : produtos.length === 0 ? (
          <EmptyState message="Você ainda não tem produtos cadastrados." icon="🏪" />
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Produto</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Preço</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Estoque</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Categoria</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {produtos.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={produto.imagemUrl || 'https://placehold.co/48x48?text=?'}
                          alt={produto.nome}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/48x48?text=?'
                          }}
                        />
                        <span className="font-medium text-gray-800">{produto.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-indigo-600 font-semibold">
                      {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`font-medium ${(produto.estoque?.quantidade ?? 0) === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                        {produto.estoque?.quantidade ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {produto.categoria?.nome ?? '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/vendedor/produtos/${produto.id}/edit`)}
                          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setProdutoParaExcluir(produto)}
                          disabled={deletando === produto.id}
                          className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          {deletando === produto.id ? '...' : 'Excluir'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={!!produtoParaExcluir}
        title="Excluir produto"
        description={produtoParaExcluir ? `Deseja excluir "${produtoParaExcluir.nome}"? Essa ação não pode ser desfeita.` : ''}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        onCancel={() => setProdutoParaExcluir(null)}
        onConfirm={() => {
          if (!produtoParaExcluir) return
          void handleDeletar(produtoParaExcluir)
          setProdutoParaExcluir(null)
        }}
      />
    </div>
  )
}
