import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { buscarProdutosPorVendedor } from '../../api/produtos'
import { criarCupom, listarCuponsPorVendedor } from '../../api/cupons'
import type { Cupom, Produto } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { LoadingSpinner } from '../../components/LoadingSpinner'
import { EmptyState } from '../../components/EmptyState'

export function CuponsVendedorPage() {
  const { usuario } = useAuth()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [cupons, setCupons] = useState<Cupom[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)

  const [codigo, setCodigo] = useState('')
  const [desconto, setDesconto] = useState('10')
  const [usoMaximo, setUsoMaximo] = useState('1')
  const [dataValidade, setDataValidade] = useState('')
  const [produtoId, setProdutoId] = useState('')

  const produtoPorId = useMemo(
    () => new Map(produtos.map((produto) => [produto.id, produto])),
    [produtos]
  )

  async function carregarDados() {
    if (!usuario) return
    setLoading(true)
    try {
      const [resProdutos, resCupons] = await Promise.all([
        buscarProdutosPorVendedor(usuario.id),
        listarCuponsPorVendedor(usuario.id),
      ])
      setProdutos(resProdutos.data)
      setCupons(resCupons.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void carregarDados()
  }, [usuario])

  async function handleCriarCupom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!usuario) return
    if (!produtoId) {
      toast.error('Selecione um produto.')
      return
    }

    setSalvando(true)
    try {
      const hoje = new Date().toISOString().slice(0, 10)
      if (!dataValidade || dataValidade < hoje) {
        toast.error('Informe uma data de validade futura.')
        return
      }

      const descontoNumero = Number(desconto)
      if (Number.isNaN(descontoNumero) || descontoNumero <= 0 || descontoNumero > 100) {
        toast.error('Desconto deve ser entre 1 e 100.')
        return
      }

      const usoMaximoNumero = Number(usoMaximo)
      if (Number.isNaN(usoMaximoNumero) || usoMaximoNumero <= 0) {
        toast.error('Uso máximo deve ser maior que zero.')
        return
      }

      await criarCupom({
        codigo: codigo.trim().toUpperCase(),
        desconto: descontoNumero,
        dataValidade,
        usoMaximo: usoMaximoNumero,
        produtoId: Number(produtoId),
        vendedorId: usuario.id,
      })

      toast.success('Cupom criado com sucesso.')
      setCodigo('')
      setDesconto('10')
      setUsoMaximo('1')
      setDataValidade('')
      setProdutoId('')
      await carregarDados()
    } catch {
      toast.error('Não foi possível criar o cupom.')
    } finally {
      setSalvando(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Cupons dos meus produtos</h1>

        {produtos.length === 0 ? (
          <EmptyState message="Cadastre produtos antes de criar cupons." icon="🏷️" />
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Novo cupom</h2>
            <form onSubmit={handleCriarCupom} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                placeholder="Código (ex.: DESCONTO10)"
                className="border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              <select
                value={produtoId}
                onChange={(e) => setProdutoId(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
                required
              >
                <option value="">Selecione o produto</option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={100}
                value={desconto}
                onChange={(e) => setDesconto(e.target.value)}
                placeholder="Desconto (%)"
                className="border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              <input
                type="number"
                min={1}
                value={usoMaximo}
                onChange={(e) => setUsoMaximo(e.target.value)}
                placeholder="Uso máximo"
                className="border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              <input
                type="date"
                value={dataValidade}
                onChange={(e) => setDataValidade(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              <button
                type="submit"
                disabled={salvando}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 font-medium disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : 'Criar cupom'}
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Código</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Produto</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Desconto</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Validade</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-500">Uso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cupons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nenhum cupom criado até agora.
                  </td>
                </tr>
              ) : (
                cupons.map((cupom) => (
                  <tr key={cupom.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{cupom.codigo}</td>
                    <td className="px-4 py-4 text-gray-700">
                      {produtoPorId.get(cupom.produtoId)?.nome ?? `Produto #${cupom.produtoId}`}
                    </td>
                    <td className="px-4 py-4 text-center text-indigo-600 font-semibold">{cupom.desconto}%</td>
                    <td className="px-4 py-4 text-center text-gray-700">
                      {new Date(`${cupom.dataValidade}T00:00:00`).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-700">
                      {cupom.usoAtual ?? 0}/{cupom.usoMaximo ?? '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
