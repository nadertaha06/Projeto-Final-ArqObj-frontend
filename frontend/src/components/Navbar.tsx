import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarrinho } from '../context/CarrinhoContext'

export function Navbar() {
  const { usuario, logout, isCliente, isVendedor } = useAuth()
  const { totalItens } = useCarrinho()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              ShopApp
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/produtos" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                Produtos
              </Link>
              {isCliente() && (
                <Link to="/pedidos" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                  Meus Pedidos
                </Link>
              )}
              {isVendedor() && (
                <>
                  <Link to="/vendedor/produtos" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                    Meus Produtos
                  </Link>
                  <Link to="/vendedor/cupons" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                    Cupons
                  </Link>
                  <Link to="/vendedor/pedidos" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                    Pedidos Recebidos
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isCliente() && (
              <Link to="/carrinho" className="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalItens > 0 && (
                  <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItens > 99 ? '99+' : totalItens}
                  </span>
                )}
              </Link>
            )}

            {usuario ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-700 font-medium hidden sm:block">
                  Olá, {usuario.nome.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/cadastro"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
