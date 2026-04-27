import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { buscarPedido, cancelarPedido } from '../api/pedidos'
import { buscarEntregaPorPedido } from '../api/entregas'
import { criarAvaliacao } from '../api/avaliacoes'
import { listarAvaliacoesPorProduto } from '../api/avaliacoes'
import type { Pedido, Entrega, ItemPedido } from '../types'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/StatusBadge'
import { StarRating } from '../components/StarRating'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ConfirmDialog } from '../components/ConfirmDialog'

export function PedidoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [entrega, setEntrega] = useState<Entrega | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelando, setCancelando] = useState(false)
  const [confirmarCancelamento, setConfirmarCancelamento] = useState(false)

  const [avaliacaoItem, setAvaliacaoItem] = useState<ItemPedido | null>(null)
  const [produtosJaAvaliados, setProdutosJaAvaliados] = useState<Set<number>>(new Set())
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviandoAvaliacao, setEnviandoAvaliacao] = useState(false)

  async function carregar() {
    if (!id) return
    setLoading(true)
    try {
      const [pedRes] = await Promise.all([
        buscarPedido(Number(id)),
      ])
      setPedido(pedRes.data)
      if (usuario && pedRes.data.status === 'ENTREGUE') {
        const idsProdutos = pedRes.data.itens.map((item) => item.produto.id)
        const resultados = await Promise.all(
          idsProdutos.map((produtoId) =>
            listarAvaliacoesPorProduto(produtoId)
              .then((res) => ({ produtoId, avaliado: res.data.some((a) => a.clienteId === usuario.id) }))
              .catch(() => ({ produtoId, avaliado: false }))
          )
        )
        const set = new Set<number>()
        resultados.forEach((r) => {
          if (r.avaliado) set.add(r.produtoId)
        })
        setProdutosJaAvaliados(set)
      } else {
        setProdutosJaAvaliados(new Set())
      }
      buscarEntregaPorPedido(Number(id))
        .then((r) => setEntrega(r.data))
        .catch(() => setEntrega(null))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { carregar() }, [id])

  async function handleCancelar() {
    if (!pedido) return
    setCancelando(true)
    try {
      await cancelarPedido(pedido.id)
      toast.success('Pedido cancelado.')
      await carregar()
    } catch {
      toast.error('Erro ao cancelar pedido.')
    } finally {
      setCancelando(false)
    }
  }

  async function handleAvaliar() {
    if (!usuario || !avaliacaoItem || !pedido) return
    setEnviandoAvaliacao(true)
    try {
      await criarAvaliacao(nota, comentario, usuario.id, avaliacaoItem.produto.id, pedido.id)
      toast.success('Avaliação enviada!')
      setProdutosJaAvaliados((prev) => new Set(prev).add(avaliacaoItem.produto.id))
      setAvaliacaoItem(null)
      setComentario('')
      setNota(5)
    } catch {
      toast.error('Erro ao enviar avaliação.')
    } finally {
      setEnviandoAvaliacao(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!pedido) return <p className="text-center py-20 text-gray-500">Pedido não encontrado.</p>

  const podeCancelar = pedido.status === 'AGUARDANDO_PAGAMENTO' || pedido.status === 'PAGO'
  const podeAvaliar = pedido.status === 'ENTREGUE'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate('/pedidos')}
          className="text-indigo-600 hover:underline text-sm mb-6 flex items-center gap-1"
        >
          ← Voltar para pedidos
        </button>

        {/* Cabeçalho */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Pedido #{pedido.id}</h1>
              <p className="text-gray-500 text-sm mt-1">
                {new Date(pedido.dataCriacao).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <div className="flex flex-col sm:items-end gap-2">
              <StatusBadge status={pedido.status} />
              <p className="text-2xl font-bold text-indigo-600">
                {pedido.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>

          {podeCancelar && (
            <button
              onClick={() => setConfirmarCancelamento(true)}
              disabled={cancelando}
              className="mt-4 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {cancelando ? 'Cancelando...' : 'Cancelar Pedido'}
            </button>
          )}
        </div>

        {/* Itens */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Itens do pedido</h2>
          <div className="space-y-4">
            {pedido.itens?.map((item) => (
              <div key={item.id}>
                <div className="flex items-center gap-4">
                  <img
                    src={item.produto.imagemUrl || 'https://placehold.co/64x64?text=?'}
                    alt={item.produto.nome}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=?'
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.produto.nome}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantidade}x {item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-indigo-600">
                      {(item.quantidade * item.precoUnitario).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    {podeAvaliar && !produtosJaAvaliados.has(item.produto.id) && (
                      <button
                        onClick={() => {
                          setAvaliacaoItem(item)
                          setNota(5)
                          setComentario('')
                        }}
                        className="text-sm text-indigo-600 hover:underline mt-1"
                      >
                        Avaliar
                      </button>
                    )}
                    {podeAvaliar && produtosJaAvaliados.has(item.produto.id) && (
                      <span className="text-sm text-green-700 mt-1 block">Já avaliado</span>
                    )}
                  </div>
                </div>

                {/* Modal inline de avaliação */}
                {avaliacaoItem?.id === item.id && (
                  <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Avaliar: {item.produto.nome}</h3>
                    <div className="mb-3">
                      <label className="text-sm text-gray-600 block mb-1">Nota:</label>
                      <StarRating value={nota} onChange={setNota} />
                    </div>
                    <textarea
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      rows={3}
                      placeholder="Escreva seu comentário..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={handleAvaliar}
                        disabled={enviandoAvaliacao || !comentario.trim()}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {enviandoAvaliacao ? 'Enviando...' : 'Enviar'}
                      </button>
                      <button
                        onClick={() => setAvaliacaoItem(null)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Entrega */}
        {entrega && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Informações de Entrega</h2>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-gray-500 w-32">Status:</span>
                <span className="font-medium text-gray-800">{entrega.status}</span>
              </div>
              {entrega.codigoRastreio && (
                <div className="flex gap-2">
                  <span className="text-gray-500 w-32">Rastreio:</span>
                  <span className="font-medium text-gray-800 font-mono">{entrega.codigoRastreio}</span>
                </div>
              )}
              {entrega.previsaoEntrega && (
                <div className="flex gap-2">
                  <span className="text-gray-500 w-32">Previsão:</span>
                  <span className="font-medium text-gray-800">
                    {new Date(entrega.previsaoEntrega).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirmarCancelamento}
        title="Cancelar pedido"
        description="Deseja realmente cancelar este pedido?"
        confirmText="Cancelar pedido"
        cancelText="Voltar"
        variant="danger"
        onCancel={() => setConfirmarCancelamento(false)}
        onConfirm={() => {
          setConfirmarCancelamento(false)
          void handleCancelar()
        }}
      />
    </div>
  )
}
