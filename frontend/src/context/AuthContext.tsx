import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Usuario, LoginResponse } from '../types'
import { setUnauthorizedHandler } from '../api/axios'

interface AuthContextData {
  usuario: Usuario | null
  loading: boolean
  login: (data: LoginResponse) => void
  logout: () => void
  isCliente: () => boolean
  isVendedor: () => boolean
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  // loading=true enquanto o estado inicial ainda não foi lido do localStorage.
  // Isso evita que PrivateRoute/VendedorRoute redirecionem para /login no primeiro render
  // antes de o usuario ser populado a partir do localStorage.
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  // Ref para evitar que o handler de 401 dispare logo após o login
  // (janela de 2s em que chamadas de dados podem retornar 401 por race condition no backend).
  const loginTimestampRef = useRef<number>(0)

  useEffect(() => {
    // Inicializa o estado a partir do localStorage uma única vez na montagem.
    const token = localStorage.getItem('token')
    const stored = localStorage.getItem('usuario')
    if (token && stored) {
      try {
        setUsuario(JSON.parse(stored))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // Registra o handler de 401 no interceptor do axios.
    // Quando um 401 chegar e o token existir, faz logout via React state
    // e navega para /login sem hard-reload, preservando o estado do React Router.
    setUnauthorizedHandler(() => {
      // Ignora 401s que chegam dentro de 2 segundos após o login,
      // pois podem ser chamadas legítimas de dados cujo backend ainda não processou o token.
      const msSinceLogin = Date.now() - loginTimestampRef.current
      if (msSinceLogin < 2000) return
      setUsuario(null)
      navigate('/login', { replace: true })
    })
  }, [navigate])

  function login(data: LoginResponse) {
    const u: Usuario = { id: data.id, nome: data.nome, email: data.email, tipo: data.tipo }
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(u))
    loginTimestampRef.current = Date.now()
    setUsuario(u)
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  const isCliente = () => usuario?.tipo === 'CLIENTE'
  const isVendedor = () => usuario?.tipo === 'VENDEDOR'

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, isCliente, isVendedor }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
