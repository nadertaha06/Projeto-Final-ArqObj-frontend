import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: 'http://localhost:8080',
})

// Callback registrado pelo AuthContext para executar logout via React state,
// evitando o uso de window.location.href que causa hard-reload e destrói o estado React.
let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/api/auth/')
    if (error.response?.status === 401 && !isLoginRequest) {
      const hasToken = !!localStorage.getItem('token')
      if (hasToken) {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        toast.error('Sessão expirada. Faça login novamente.')
        if (onUnauthorized) {
          // Deixa o React Router fazer o redirect via state, sem hard-reload.
          onUnauthorized()
        } else {
          // Fallback caso o handler ainda não tenha sido registrado.
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api
