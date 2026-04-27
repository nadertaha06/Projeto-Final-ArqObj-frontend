import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listarProdutos } from '../api/produtos'
import { listarCategorias } from '../api/categorias'
import type { Produto, Categoria } from '../types'
import { ProdutoCard } from '../components/ProdutoCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'

export function HomePage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([listarProdutos(), listarCategorias()])
      .then(([prodRes, catRes]) => {
        setProdutos(prodRes.data.slice(0, 6))
        setCategorias(catRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const categoryIcons = ['🛍️', '👕', '📱', '🏠', '🎮', '📚', '🍎', '⚽']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Bem-vindo ao ShopApp</h1>
          <p className="text-xl text-indigo-100 mb-8">
            Encontre os melhores produtos com os melhores preços
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/produtos"
              className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Ver Produtos
            </Link>
            {!usuario && (
              <Link
                to="/cadastro"
                className="bg-indigo-500 hover:bg-indigo-400 text-white border border-white/30 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Criar Conta Grátis
              </Link>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categorias */}
        {categorias.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Categorias</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categorias.map((cat, i) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/produtos?categoria=${cat.id}`)}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-all p-4 flex flex-col items-center gap-2 text-center"
                >
                  <span className="text-3xl">{categoryIcons[i % categoryIcons.length]}</span>
                  <span className="text-sm font-medium text-gray-700">{cat.nome}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Produtos em destaque */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Produtos em Destaque</h2>
            <Link to="/produtos" className="text-indigo-600 hover:underline font-medium text-sm">
              Ver todos →
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : produtos.length === 0 ? (
            <p className="text-gray-500 text-center py-10">Nenhum produto disponível ainda.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {produtos.map((p) => (
                <ProdutoCard key={p.id} produto={p} />
              ))}
            </div>
          )}
        </section>

        {/* CTA para não autenticados */}
        {!usuario && (
          <section className="mt-16 bg-indigo-50 rounded-2xl p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Quer vender seus produtos?
            </h2>
            <p className="text-gray-600 mb-6">
              Crie uma conta de vendedor e comece a vender hoje mesmo.
            </p>
            <Link
              to="/cadastro"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              Começar agora
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}
