import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { criarPedido, listarPedidosPorCliente, type EnderecoEntregaData } from '../api/pedidos'
import { processarPagamento, type PagamentoData } from '../api/pagamentos'
import { validarCupom, consumirCupom } from '../api/cupons'
import { buscarClientePorId } from '../api/clientes'
import type { Cupom } from '../types'
import { useAuth } from '../context/AuthContext'
import { useCarrinho } from '../context/CarrinhoContext'
import { EmptyState } from '../components/EmptyState'

type TipoPagamento = 'PIX' | 'CARTAO' | 'BOLETO'

export function CheckoutPage() {
  const { usuario } = useAuth()
  const { carrinho, recarregarCarrinho } = useCarrinho()
  const navigate = useNavigate()

  const [tipoPagamento, setTipoPagamento] = useState<TipoPagamento>('PIX')
  const [codigoCupom, setCodigoCupom] = useState('')
  const [cupom, setCupom] = useState<Cupom | null>(null)
  const [erroCupom, setErroCupom] = useState('')
  const [carregandoCupom, setCarregandoCupom] = useState(false)
  const [confirmando, setConfirmando] = useState(false)

  // Campos PIX
  const [chavePix, setChavePix] = useState('')
  // Campos Cartão
  const [ultimosDigitos, setUltimosDigitos] = useState('')
  const [nomeTitular, setNomeTitular] = useState('')
  const [parcelas, setParcelas] = useState(1)
  // Endereço de entrega
  const [rua, setRua] = useState('')
  const [numero, setNumero] = useState('')
  const [complemento, setComplemento] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [cep, setCep] = useState('')

  useEffect(() => {
    if (!usuario) return
    buscarClientePorId(usuario.id)
      .then((res) => {
        const endereco = res.data.enderecos?.[0]
        if (!endereco) return
        setRua((prev) => prev || endereco.rua || '')
        setNumero((prev) => prev || endereco.numero || '')
        setComplemento((prev) => prev || endereco.complemento || '')
        setBairro((prev) => prev || endereco.bairro || '')
        setCidade((prev) => prev || endereco.cidade || '')
        setEstado((prev) => prev || endereco.estado || '')
        setCep((prev) => prev || endereco.cep || '')
      })
      .catch(() => {})
  }, [usuario])

  const itens = carrinho?.itens ?? []
  const subtotal = itens.reduce((s, i) => s + i.produto.preco * i.quantidade, 0)
  const itemComCupom = cupom ? itens.find((item) => item.produto.id === cupom.produtoId) : null
  const totalProdutoComCupom = itemComCupom ? itemComCupom.produto.preco * itemComCupom.quantidade : 0
  const desconto = cupom ? (totalProdutoComCupom * cupom.desconto) / 100 : 0
  const total = subtotal - desconto

  async function aplicarCupom() {
    if (!codigoCupom.trim()) return
    setCarregandoCupom(true)
    setErroCupom('')
    try {
      const codigo = codigoCupom.trim()
      const validacoes = await Promise.allSettled(
        itens.map((item) => validarCupom(codigo, item.produto.id))
      )
      const resultadoValido = validacoes.find(
        (resultado): resultado is PromiseFulfilledResult<Awaited<ReturnType<typeof validarCupom>>> =>
          resultado.status === 'fulfilled'
      )

      if (!resultadoValido) {
        setErroCupom('Cupom inválido para os produtos do carrinho.')
        setCupom(null)
        return
      }

      const res = resultadoValido.value
      if (!res.data.ativo) {
        setErroCupom('Cupom inativo ou expirado.')
        setCupom(null)
      } else {
        setCupom(res.data)
      }
    } catch {
      setErroCupom('Cupom inválido ou não encontrado.')
      setCupom(null)
    } finally {
      setCarregandoCupom(false)
    }
  }

  async function confirmarPedido() {
    if (!usuario) return
    if (tipoPagamento === 'PIX' && !chavePix.trim()) {
      toast.error('Informe a chave PIX.')
      return
    }
    if (tipoPagamento === 'CARTAO' && (!ultimosDigitos || !nomeTitular)) {
      toast.error('Preencha os dados do cartão.')
      return
    }
    if (!rua.trim() || !numero.trim() || !bairro.trim() || !cidade.trim() || !estado.trim() || !cep.trim()) {
      toast.error('Preencha o endereço de entrega.')
      return
    }

    setConfirmando(true)
    try {
      const enderecoEntrega: EnderecoEntregaData = {
        rua: rua.trim(),
        numero: numero.trim(),
        complemento: complemento.trim() || undefined,
        bairro: bairro.trim(),
        cidade: cidade.trim(),
        estado: estado.trim().toUpperCase().slice(0, 2),
        cep: cep.replace(/\D/g, '').slice(0, 8),
      }

      let pedidoId: number
      try {
        const pedidoRes = await criarPedido(usuario.id, enderecoEntrega)
        pedidoId = pedidoRes.data.id
      } catch (error) {
        // Se o carrinho já foi convertido em pedido numa tentativa anterior,
        // reaproveita o pedido pendente para concluir o pagamento.
        if (axios.isAxiosError(error) && error.response?.status === 422) {
          const pedidosRes = await listarPedidosPorCliente(usuario.id)
          const pedidoPendente = pedidosRes.data.find((p) => p.status === 'AGUARDANDO_PAGAMENTO')
          if (!pedidoPendente) {
            throw error
          }
          pedidoId = pedidoPendente.id
        } else {
          throw error
        }
      }

      let pagamentoData: PagamentoData
      if (tipoPagamento === 'PIX') {
        pagamentoData = { tipo: 'PagamentoPix', chavePix }
      } else if (tipoPagamento === 'CARTAO') {
        pagamentoData = {
          tipo: 'PagamentoCartao',
          ultimosQuatroDigitos: ultimosDigitos,
          nomeTitular,
          parcelas,
        }
      } else {
        pagamentoData = { tipo: 'PagamentoBoleto' }
      }

      await processarPagamento(pedidoId, pagamentoData)
      if (cupom) {
        await consumirCupom(cupom.codigo, cupom.produtoId)
      }
      await recarregarCarrinho()
      toast.success('Pedido realizado com sucesso!')
      navigate(`/pedidos/${pedidoId}`)
    } catch {
      toast.error('Erro ao confirmar pedido. Tente novamente.')
    } finally {
      setConfirmando(false)
    }
  }

  if (itens.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <EmptyState message="Seu carrinho está vazio." icon="🛒" />
      </div>
    )
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resumo dos itens */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Itens do pedido</h2>
              <div className="space-y-3">
                {itens.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.produto.imagemUrl || 'https://placehold.co/48x48?text=?'}
                      alt={item.produto.nome}
                      className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/48x48?text=?'
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{item.produto.nome}</p>
                      <p className="text-xs text-gray-500">Qtd: {item.quantidade}</p>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600">
                      {(item.produto.preco * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cupom */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Cupom de desconto</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={codigoCupom}
                  onChange={(e) => {
                    setCodigoCupom(e.target.value.toUpperCase())
                    setErroCupom('')
                    setCupom(null)
                  }}
                  placeholder="Código do cupom"
                  className={`flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${erroCupom ? 'border-red-400' : 'border-gray-300'}`}
                />
                <button
                  onClick={aplicarCupom}
                  disabled={carregandoCupom || !codigoCupom.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                >
                  {carregandoCupom ? '...' : 'Aplicar'}
                </button>
              </div>
              {erroCupom && <p className="text-red-500 text-sm mt-2">{erroCupom}</p>}
              {cupom && (
                <p className="text-green-600 text-sm mt-2 font-medium">
                  Cupom aplicado! {cupom.desconto}% de desconto no produto selecionado.
                </p>
              )}
            </div>

            {/* Pagamento */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Forma de pagamento</h2>
              <div className="space-y-3 mb-5">
                {(['PIX', 'CARTAO', 'BOLETO'] as TipoPagamento[]).map((tipo) => (
                  <label key={tipo} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${tipoPagamento === tipo ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="pagamento"
                      value={tipo}
                      checked={tipoPagamento === tipo}
                      onChange={() => setTipoPagamento(tipo)}
                      className="text-indigo-600"
                    />
                    <span className="font-medium text-gray-700">
                      {tipo === 'PIX' ? '⚡ PIX' : tipo === 'CARTAO' ? '💳 Cartão de Crédito' : '📄 Boleto Bancário'}
                    </span>
                  </label>
                ))}
              </div>

              {tipoPagamento === 'PIX' && (
                <div>
                  <label className={labelClass}>Chave PIX</label>
                  <input
                    value={chavePix}
                    onChange={(e) => setChavePix(e.target.value)}
                    placeholder="CPF, email, telefone ou chave aleatória"
                    className={inputClass}
                  />
                </div>
              )}

              {tipoPagamento === 'CARTAO' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Últimos 4 dígitos do cartão</label>
                    <input
                      value={ultimosDigitos}
                      onChange={(e) => setUltimosDigitos(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="1234"
                      maxLength={4}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nome do titular</label>
                    <input
                      value={nomeTitular}
                      onChange={(e) => setNomeTitular(e.target.value.toUpperCase())}
                      placeholder="NOME COMO NO CARTÃO"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Parcelas</label>
                    <select
                      value={parcelas}
                      onChange={(e) => setParcelas(Number(e.target.value))}
                      className={`${inputClass} bg-white`}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n}x de {(total / n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          {n === 1 ? ' (à vista)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {tipoPagamento === 'BOLETO' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
                  O código do boleto será gerado após a confirmação do pedido. Prazo de pagamento: 3 dias úteis.
                </div>
              )}
            </div>

            {/* Endereço de entrega */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-gray-800 mb-4">Endereço de entrega</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelClass}>Rua</label>
                  <input value={rua} onChange={(e) => setRua(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Número</label>
                  <input value={numero} onChange={(e) => setNumero(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Complemento (opcional)</label>
                  <input value={complemento} onChange={(e) => setComplemento(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Bairro</label>
                  <input value={bairro} onChange={(e) => setBairro(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cidade</label>
                  <input value={cidade} onChange={(e) => setCidade(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Estado (UF)</label>
                  <input value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} maxLength={2} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>CEP</label>
                  <input value={cep} onChange={(e) => setCep(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* Resumo do pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="font-semibold text-gray-800 mb-4">Resumo</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                {cupom && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto ({cupom.desconto}% em 1 produto)</span>
                    <span>-{desconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg text-gray-800">
                  <span>Total</span>
                  <span className="text-indigo-600">
                    {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>

              <button
                onClick={confirmarPedido}
                disabled={confirmando}
                className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                {confirmando ? 'Processando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
