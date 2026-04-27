import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { CarrinhoProvider } from './context/CarrinhoContext'
import { PrivateRoute, VendedorRoute } from './components/PrivateRoute'
import { Navbar } from './components/Navbar'

import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { CadastroPage } from './pages/CadastroPage'
import { ProdutosPage } from './pages/ProdutosPage'
import { ProdutoDetalhePage } from './pages/ProdutoDetalhePage'
import { CarrinhoPage } from './pages/CarrinhoPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { MeusPedidosPage } from './pages/MeusPedidosPage'
import { PedidoDetalhePage } from './pages/PedidoDetalhePage'
import { MeusProdutosPage } from './pages/vendedor/MeusProdutosPage'
import { CriarProdutoPage } from './pages/vendedor/CriarProdutoPage'
import { EditarProdutoPage } from './pages/vendedor/EditarProdutoPage'
import { PedidosVendedorPage } from './pages/vendedor/PedidosVendedorPage'
import { CuponsVendedorPage } from './pages/vendedor/CuponsVendedorPage'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CarrinhoProvider>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Layout>
            <Routes>
              {/* Públicas */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cadastro" element={<CadastroPage />} />
              <Route path="/produtos" element={<ProdutosPage />} />
              <Route path="/produtos/:id" element={<ProdutoDetalhePage />} />

              {/* Cliente */}
              <Route path="/carrinho" element={<PrivateRoute><CarrinhoPage /></PrivateRoute>} />
              <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
              <Route path="/pedidos" element={<PrivateRoute><MeusPedidosPage /></PrivateRoute>} />
              <Route path="/pedidos/:id" element={<PrivateRoute><PedidoDetalhePage /></PrivateRoute>} />

              {/* Vendedor */}
              <Route path="/vendedor/produtos" element={<VendedorRoute><MeusProdutosPage /></VendedorRoute>} />
              <Route path="/vendedor/produtos/novo" element={<VendedorRoute><CriarProdutoPage /></VendedorRoute>} />
              <Route path="/vendedor/produtos/:id/edit" element={<VendedorRoute><EditarProdutoPage /></VendedorRoute>} />
              <Route path="/vendedor/cupons" element={<VendedorRoute><CuponsVendedorPage /></VendedorRoute>} />
              <Route path="/vendedor/pedidos" element={<VendedorRoute><PedidosVendedorPage /></VendedorRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </CarrinhoProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
