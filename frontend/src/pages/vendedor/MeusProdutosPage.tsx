import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { buscarProdutosPorVendedor, atualizarStatusProduto } from '../../api/produtos'
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
  const [atualizandoStatus, setAtualizandoStatus] = useState<number | null>(null)
  const [produtoParaAlternar, setProdutoParaAlternar] = useState<Produto | null>(null)

  async function carregar() {
    if (!usuario) return
    setLoading(true)
    buscarProdutosPorVendedor(usuario.id)
      .then((r) => setProdutos(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [usuario])

  async function handleAlternarStatus(produto: Produto) {
    setAtualizandoStatus(produto.id)
    try {
      const ativoAtualizado = !produto.ativo
      const res = await atualizarStatusProduto(produto.id, ativoAtualizado)
      toast.success(ativoAtualizado ? 'Produto ativado.' : 'Produto desativado.')
      setProdutos((prev) => prev.map((p) => (p.id === produto.id ? res.data : p)))
    } catch {
      toast.error('Erro ao atualizar status do produto.')
    } finally {
      setAtualizandoStatus(null)
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
                        <div>
                          <span className="font-medium text-gray-800">{produto.nome}</span>
                          {!produto.ativo && (
                            <p className="text-xs text-red-600 font-medium">Inativo</p>
                          )}
                        </div>
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
                          onClick={() => setProdutoParaAlternar(produto)}
                          disabled={atualizandoStatus === produto.id}
                          className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${produto.ativo ? 'bg-red-50 hover:bg-red-100 text-red-600' : 'bg-green-50 hover:bg-green-100 text-green-700'}`}
                        >
                          {atualizandoStatus === produto.id ? '...' : produto.ativo ? 'Desativar' : 'Ativar'}
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
        open={!!produtoParaAlternar}
        title={produtoParaAlternar?.ativo ? 'Desativar produto' : 'Ativar produto'}
        description={produtoParaAlternar ? (produtoParaAlternar.ativo
          ? `Deseja desativar "${produtoParaAlternar.nome}"? Ele deixará de aparecer para compra, mas continuará em pedidos já feitos.`
          : `Deseja ativar "${produtoParaAlternar.nome}"? Ele voltará a aparecer para compra.`) : ''}
        confirmText={produtoParaAlternar?.ativo ? 'Desativar' : 'Ativar'}
        cancelText="Cancelar"
        variant={produtoParaAlternar?.ativo ? 'danger' : 'default'}
        onCancel={() => setProdutoParaAlternar(null)}
        onConfirm={() => {
          if (!produtoParaAlternar) return
          void handleAlternarStatus(produtoParaAlternar)
          setProdutoParaAlternar(null)
        }}
      />
    </div>
  )
}
