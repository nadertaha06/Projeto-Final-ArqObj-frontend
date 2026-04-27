import type { StatusPedido } from '../types'

const statusConfig: Record<StatusPedido, { label: string; classes: string }> = {
  AGUARDANDO_PAGAMENTO: { label: 'Aguardando Pagamento', classes: 'bg-yellow-100 text-yellow-800' },
  PAGO: { label: 'Pago', classes: 'bg-blue-100 text-blue-800' },
  EM_PREPARACAO: { label: 'Em Preparação', classes: 'bg-orange-100 text-orange-800' },
  ENVIADO: { label: 'Enviado', classes: 'bg-purple-100 text-purple-800' },
  ENTREGUE: { label: 'Entregue', classes: 'bg-green-100 text-green-800' },
  CANCELADO: { label: 'Cancelado', classes: 'bg-red-100 text-red-800' },
}

export function StatusBadge({ status }: { status: StatusPedido }) {
  const config = statusConfig[status] ?? { label: status, classes: 'bg-gray-100 text-gray-800' }
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.classes}`}>
      {config.label}
    </span>
  )
}
