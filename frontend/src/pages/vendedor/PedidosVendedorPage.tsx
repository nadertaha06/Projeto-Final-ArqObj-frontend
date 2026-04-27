import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { listarPedidosPorVendedor, atualizarStatusPedido, cancelarPedido } from '../../api/pedidos'
import type { Pedido } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { StatusBadge } from '../../components/StatusBadge'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { EmptyState } from '../../components/EmptyState'
import { ConfirmDialog } from '../../components/ConfirmDialog'

export function PedidosVendedorPage() {
  const { usuario } = useAuth()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [atualizandoId, setAtualizandoId] = useState<number | null>(null)
  const [pedidoParaCancelar, setPedidoParaCancelar] = useState<Pedido | null>(null)

  async function carregar() {
    if (!usuario) return
    setLoading(true)
    try {
      const res = await listarPedidosPorVendedor(usuario.id)
      setPedidos(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [usuario])

  async function avancarStatus(pedido: Pedido) {
    const proximo = pedido.status === 'PAGO' ? 'ENVIADO' : pedido.status === 'ENVIADO' ? 'ENTREGUE' : null
    if (!proximo) return
    setAtualizandoId(pedido.id)
    try {
      await atualizarStatusPedido(pedido.id, proximo)
      toast.success(proximo === 'ENVIADO' ? 'Pedido marcado como em trânsito.' : 'Pedido marcado como entregue.')
      await carregar()
    } catch {
      toast.error('Erro ao atualizar status do pedido.')
    } finally {
      setAtualizandoId(null)
    }
  }

  async function cancelar(pedido: Pedido) {
    setAtualizandoId(pedido.id)
    try {
      await cancelarPedido(pedido.id)
      toast.success('Pedido cancelado.')
      await carregar()
    } catch {
      toast.error('Erro ao cancelar pedido.')
    } finally {
      setAtualizandoId(null)
    }
  }

  if (loading) return <LoadingSpinner />

  if (pedidos.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Pedidos dos meus produtos</h1>
          <EmptyState message="Nenhum pedido encontrado para seus produtos." icon="📦" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Pedidos dos meus produtos</h1>

        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <p className="font-semibold text-gray-800">Pedido #{pedido.id}</p>
                  <p className="text-sm text-gray-500">
                    Cliente: {pedido.cliente?.nome ?? '—'} • {new Date(pedido.dataCriacao).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={pedido.status} />
                  <span className="font-bold text-indigo-600">
                    {pedido.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {pedido.itens.map((item) => (
                  <div key={item.id} className="text-sm text-gray-700">
                    {item.quantidade}x {item.produto.nome} — {(item.precoUnitario * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>
                ))}
              </div>

              <div className="text-sm text-gray-700 mb-4">
                <p className="font-medium text-gray-800 mb-1">Endereço de entrega</p>
                {pedido.entrega?.endereco ? (
                  <p>
                    {pedido.entrega.endereco.rua}, {pedido.entrega.endereco.numero}
                    {pedido.entrega.endereco.complemento ? `, ${pedido.entrega.endereco.complemento}` : ''}
                    {' - '}
                    {pedido.entrega.endereco.bairro}, {pedido.entrega.endereco.cidade}/{pedido.entrega.endereco.estado} - CEP {pedido.entrega.endereco.cep}
                  </p>
                ) : (
                  <p>Endereço não informado.</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {(pedido.status === 'PAGO' || pedido.status === 'ENVIADO') && (
                  <button
                    onClick={() => avancarStatus(pedido)}
                    disabled={atualizandoId === pedido.id}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                  >
                    {pedido.status === 'PAGO' ? 'Marcar em trânsito' : 'Marcar como entregue'}
                  </button>
                )}
                {(pedido.status === 'PAGO' || pedido.status === 'EM_PREPARACAO') && (
                  <button
                    onClick={() => setPedidoParaCancelar(pedido)}
                    disabled={atualizandoId === pedido.id}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                  >
                    Cancelar pedido
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <ConfirmDialog
        open={!!pedidoParaCancelar}
        title="Cancelar pedido"
        description={pedidoParaCancelar ? `Deseja realmente cancelar o pedido #${pedidoParaCancelar.id}?` : ''}
        confirmText="Cancelar pedido"
        cancelText="Voltar"
        variant="danger"
        onCancel={() => setPedidoParaCancelar(null)}
        onConfirm={() => {
          if (!pedidoParaCancelar) return
          void cancelar(pedidoParaCancelar)
          setPedidoParaCancelar(null)
        }}
      />
    </div>
  )
}
