import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarPedidosPorCliente } from '../api/pedidos'
import type { Pedido } from '../types'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/StatusBadge'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'

export function MeusPedidosPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario) return
    listarPedidosPorCliente(usuario.id)
      .then((r) => {
        const ordenados = [...r.data].sort(
          (a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
        )
        setPedidos(ordenados)
      })
      .finally(() => setLoading(false))
  }, [usuario])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Meus Pedidos</h1>

        {loading ? (
          <LoadingSpinner />
        ) : pedidos.length === 0 ? (
          <EmptyState message="Você ainda não fez nenhum pedido." icon="📦" />
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-white rounded-xl shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-gray-800">Pedido #{pedido.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(pedido.dataCriacao).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {pedido.itens?.length ?? 0} {pedido.itens?.length === 1 ? 'item' : 'itens'}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2">
                  <StatusBadge status={pedido.status} />
                  <p className="text-xl font-bold text-indigo-600">
                    {pedido.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <button
                    onClick={() => navigate(`/pedidos/${pedido.id}`)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Ver detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
