import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { listarProdutos } from '../api/produtos'
import { listarCategorias } from '../api/categorias'
import type { Produto, Categoria } from '../types'
import { ProdutoCard } from '../components/ProdutoCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { EmptyState } from '../components/EmptyState'

const PER_PAGE = 8

export function ProdutosPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState(searchParams.get('nome') ?? '')
  const [categoriaId, setCategoriaId] = useState(searchParams.get('categoria') ?? '')
  const [page, setPage] = useState(1)

  useEffect(() => {
    listarCategorias().then((r) => setCategorias(r.data))
  }, [])

  const carregar = useCallback(async (nome: string, catId: string) => {
    setLoading(true)
    try {
      const res = await listarProdutos(nome || undefined)
      let data = res.data
      if (catId) {
        data = data.filter((p) => String(p.categoria?.id) === catId)
      }
      setProdutos(data)
      setPage(1)
    } finally {
      setLoading(false)
    }
  }, [])

  // debounce busca por nome
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (busca) next.set('nome', busca)
        else next.delete('nome')
        return next
      })
      carregar(busca, categoriaId)
    }, 400)
    return () => clearTimeout(timer)
  }, [busca])

  useEffect(() => {
    carregar(busca, categoriaId)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (categoriaId) next.set('categoria', categoriaId)
      else next.delete('categoria')
      return next
    })
  }, [categoriaId])

  const totalPages = Math.ceil(produtos.length / PER_PAGE)
  const paginados = produtos.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Produtos</h1>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.nome}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : paginados.length === 0 ? (
          <EmptyState message="Nenhum produto encontrado." icon="🔍" />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginados.map((p) => (
                <ProdutoCard key={p.id} produto={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                  ← Anterior
                </button>
                <span className="text-gray-600 px-3">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-40 hover:bg-gray-100 transition-colors"
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
