import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { buscarProduto } from '../api/produtos'
import { adicionarItem } from '../api/carrinho'
import { listarAvaliacoesPorProduto, criarAvaliacao } from '../api/avaliacoes'
import { listarPedidosPorCliente } from '../api/pedidos'
import type { Produto, Avaliacao, Pedido } from '../types'
import { useAuth } from '../context/AuthContext'
import { useCarrinho } from '../context/CarrinhoContext'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { StarRating } from '../components/StarRating'

export function ProdutoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const { usuario, isCliente } = useAuth()
  const { recarregarCarrinho } = useCarrinho()

  const [produto, setProduto] = useState<Produto | null>(null)
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [pedidoEntregue, setPedidoEntregue] = useState<Pedido | null>(null)
  const [jaAvaliou, setJaAvaliou] = useState(false)
  const [quantidade, setQuantidade] = useState(1)
  const [loadingProduto, setLoadingProduto] = useState(true)
  const [adicionando, setAdicionando] = useState(false)

  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoadingProduto(true)
    buscarProduto(Number(id))
      .then((r) => setProduto(r.data))
      .finally(() => setLoadingProduto(false))

    listarAvaliacoesPorProduto(Number(id))
      .then((r) => {
        setAvaliacoes(r.data)
        if (usuario) {
          setJaAvaliou(r.data.some((a) => a.clienteId === usuario.id))
        }
      })
      .catch(() => setAvaliacoes([]))
  }, [id, usuario])

  useEffect(() => {
    if (!usuario || !isCliente() || !id) return
    listarPedidosPorCliente(usuario.id).then((r) => {
      const entregue = r.data.find(
        (p) => p.status === 'ENTREGUE' && p.itens.some((item) => String(item.produto.id) === id)
      )
      setPedidoEntregue(entregue ?? null)
    }).catch(() => {})
  }, [usuario, id])

  async function handleAdicionarCarrinho() {
    if (!usuario || !produto) return
    setAdicionando(true)
    try {
      await adicionarItem(usuario.id, produto.id, quantidade)
      await recarregarCarrinho()
      toast.success('Adicionado ao carrinho!')
    } catch {
      toast.error('Erro ao adicionar ao carrinho.')
    } finally {
      setAdicionando(false)
    }
  }

  async function handleAvaliar() {
    if (!usuario || !produto || !pedidoEntregue) return
    setEnviandoAvaliacao(true)
    try {
      const nova = await criarAvaliacao(nota, comentario, usuario.id, produto.id, pedidoEntregue.id)
      setAvaliacoes((prev) => [nova.data, ...prev])
      setJaAvaliou(true)
      setComentario('')
      setNota(5)
      toast.success('Avaliação enviada!')
    } catch {
      toast.error('Erro ao enviar avaliação.')
    } finally {
      setEnviandoAvaliacao(false)
    }
  }

  if (loadingProduto) return <LoadingSpinner />
  if (!produto) return <p className="text-center py-20 text-gray-500">Produto não encontrado.</p>

  const estoque = produto.estoque?.quantidade ?? 0
  const inativo = produto.ativo === false
  const semEstoque = estoque === 0
  const ehVendedor = usuario?.id === produto.vendedor?.id
  const podeComprar = isCliente() && !ehVendedor && !semEstoque && !inativo
  const podeAvaliar = !!pedidoEntregue && !jaAvaliou

  const mediaNotas =
    avaliacoes.length > 0
      ? avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length
      : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Imagem */}
            <div className="bg-gray-100 flex items-center justify-center min-h-[350px]">
              {produto.imagemUrl ? (
                <img
                  src={produto.imagemUrl}
                  alt={produto.nome}
                  className="w-full h-full object-cover max-h-[500px]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Sem+Imagem'
                  }}
                />
              ) : (
                <span className="text-gray-400 text-sm">Sem imagem</span>
              )}
            </div>

            {/* Detalhes */}
            <div className="p-8 flex flex-col">
              {produto.categoria && (
                <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full w-fit mb-3">
                  {produto.categoria.nome}
                </span>
              )}
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{produto.nome}</h1>
              <p className="text-gray-500 text-sm mb-4">
                Vendido por <span className="font-medium text-gray-700">{produto.vendedor?.nomeLoja ?? produto.vendedor?.nome}</span>
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">{produto.descricao}</p>

              <p className="text-4xl font-bold text-indigo-600 mb-4">
                {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>

              <p className={`text-sm mb-4 ${inativo || semEstoque ? 'text-red-500' : 'text-green-600'}`}>
                {inativo ? 'Produto indisponível no momento' : semEstoque ? 'Sem estoque' : `${estoque} unidades disponíveis`}
              </p>

              {!semEstoque && podeComprar && (
                <div className="flex items-center gap-3 mb-6">
                  <label className="text-sm font-medium text-gray-700">Quantidade:</label>
                  <input
                    type="number"
                    min={1}
                    max={estoque}
                    value={quantidade}
                    onChange={(e) => setQuantidade(Math.min(estoque, Math.max(1, Number(e.target.value))))}
                    className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {isCliente() && !ehVendedor && (
                <button
                  onClick={handleAdicionarCarrinho}
                  disabled={semEstoque || adicionando || inativo}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  {adicionando ? 'Adicionando...' : inativo ? 'Indisponível' : semEstoque ? 'Sem estoque' : 'Adicionar ao Carrinho'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Avaliações */}
        <div className="mt-10">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Avaliações</h2>
            {avaliacoes.length > 0 && (
              <div className="flex items-center gap-2">
                <StarRating value={Math.round(mediaNotas)} />
                <span className="text-gray-500 text-sm">({mediaNotas.toFixed(1)}) — {avaliacoes.length} avaliações</span>
              </div>
            )}
          </div>

          {/* Formulário de avaliação */}
          {podeAvaliar && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Sua avaliação</h3>
              <div className="mb-3">
                <label className="text-sm text-gray-600 mb-1 block">Nota:</label>
                <StarRating value={nota} onChange={setNota} />
              </div>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={3}
                placeholder="Escreva seu comentário..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <button
                onClick={handleAvaliar}
                disabled={enviandoAvaliacao || !comentario.trim()}
                className="mt-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {enviandoAvaliacao ? 'Enviando...' : 'Enviar avaliação'}
              </button>
            </div>
          )}
          {!!pedidoEntregue && jaAvaliou && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-800">
              Você já avaliou este produto.
            </div>
          )}

          {avaliacoes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma avaliação ainda.</p>
          ) : (
            <div className="space-y-4">
              {avaliacoes.map((a) => (
                <div key={a.id} className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <StarRating value={a.nota} />
                    <span className="text-gray-400 text-xs">
                      {new Date(a.dataCriacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-gray-700">{a.comentario}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
