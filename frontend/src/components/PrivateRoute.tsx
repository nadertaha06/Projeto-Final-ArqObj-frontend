import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { ReactNode } from 'react'

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { usuario, loading } = useAuth()
  // Aguarda a inicialização do estado a partir do localStorage antes de redirecionar.
  // Sem isso, o primeiro render sempre vê usuario=null e redireciona indevidamente.
  if (loading) return null
  if (!usuario) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function VendedorRoute({ children }: { children: ReactNode }) {
  const { usuario, loading, isVendedor } = useAuth()
  if (loading) return null
  if (!usuario) return <Navigate to="/login" replace />
  if (!isVendedor()) return <Navigate to="/" replace />
  return <>{children}</>
}
