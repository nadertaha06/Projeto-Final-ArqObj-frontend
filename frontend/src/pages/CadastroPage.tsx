import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { registerCliente, registerVendedor } from '../api/auth'

interface ClienteFormData {
  nome: string
  email: string
  senha: string
  cpf: string
  telefone: string
}

interface VendedorFormData extends ClienteFormData {
  nomeLoja: string
}

export function CadastroPage() {
  const [tab, setTab] = useState<'cliente' | 'vendedor'>('cliente')
  const navigate = useNavigate()

  const clienteForm = useForm<ClienteFormData>()
  const vendedorForm = useForm<VendedorFormData>()

  async function onSubmitCliente(data: ClienteFormData) {
    try {
      await registerCliente(data)
      toast.success('Conta criada com sucesso! Faça login.')
      navigate('/login')
    } catch {
      toast.error('Erro ao criar conta. Verifique os dados.')
    }
  }

  async function onSubmitVendedor(data: VendedorFormData) {
    try {
      await registerVendedor(data)
      toast.success('Conta de vendedor criada! Faça login.')
      navigate('/login')
    } catch {
      toast.error('Erro ao criar conta. Verifique os dados.')
    }
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
  const errorClass = 'text-red-500 text-xs mt-1'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-indigo-600">ShopApp</h1>
          <p className="text-gray-500 mt-2">Crie sua conta</p>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-gray-200 mb-6">
          <button
            onClick={() => setTab('cliente')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === 'cliente' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Cliente
          </button>
          <button
            onClick={() => setTab('vendedor')}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              tab === 'vendedor' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Vendedor
          </button>
        </div>

        {tab === 'cliente' && (
          <form onSubmit={clienteForm.handleSubmit(onSubmitCliente)} className="space-y-4">
            <div>
              <label className={labelClass}>Nome completo</label>
              <input {...clienteForm.register('nome', { required: 'Obrigatório' })} className={inputClass} placeholder="João Silva" />
              {clienteForm.formState.errors.nome && <p className={errorClass}>{clienteForm.formState.errors.nome.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" {...clienteForm.register('email', { required: 'Obrigatório' })} className={inputClass} placeholder="joao@email.com" />
              {clienteForm.formState.errors.email && <p className={errorClass}>{clienteForm.formState.errors.email.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Senha</label>
              <input type="password" {...clienteForm.register('senha', { required: 'Obrigatório', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })} className={inputClass} placeholder="••••••••" />
              {clienteForm.formState.errors.senha && <p className={errorClass}>{clienteForm.formState.errors.senha.message}</p>}
            </div>
            <div>
              <label className={labelClass}>CPF</label>
              <input {...clienteForm.register('cpf', { required: 'Obrigatório' })} className={inputClass} placeholder="000.000.000-00" />
              {clienteForm.formState.errors.cpf && <p className={errorClass}>{clienteForm.formState.errors.cpf.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input {...clienteForm.register('telefone', { required: 'Obrigatório' })} className={inputClass} placeholder="(11) 99999-9999" />
              {clienteForm.formState.errors.telefone && <p className={errorClass}>{clienteForm.formState.errors.telefone.message}</p>}
            </div>
            <button
              type="submit"
              disabled={clienteForm.formState.isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              {clienteForm.formState.isSubmitting ? 'Criando...' : 'Criar conta'}
            </button>
          </form>
        )}

        {tab === 'vendedor' && (
          <form onSubmit={vendedorForm.handleSubmit(onSubmitVendedor)} className="space-y-4">
            <div>
              <label className={labelClass}>Nome completo</label>
              <input {...vendedorForm.register('nome', { required: 'Obrigatório' })} className={inputClass} placeholder="Maria Santos" />
              {vendedorForm.formState.errors.nome && <p className={errorClass}>{vendedorForm.formState.errors.nome.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" {...vendedorForm.register('email', { required: 'Obrigatório' })} className={inputClass} placeholder="maria@loja.com" />
              {vendedorForm.formState.errors.email && <p className={errorClass}>{vendedorForm.formState.errors.email.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Senha</label>
              <input type="password" {...vendedorForm.register('senha', { required: 'Obrigatório', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })} className={inputClass} placeholder="••••••••" />
              {vendedorForm.formState.errors.senha && <p className={errorClass}>{vendedorForm.formState.errors.senha.message}</p>}
            </div>
            <div>
              <label className={labelClass}>CPF</label>
              <input {...vendedorForm.register('cpf', { required: 'Obrigatório' })} className={inputClass} placeholder="000.000.000-00" />
              {vendedorForm.formState.errors.cpf && <p className={errorClass}>{vendedorForm.formState.errors.cpf.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input {...vendedorForm.register('telefone', { required: 'Obrigatório' })} className={inputClass} placeholder="(11) 99999-9999" />
              {vendedorForm.formState.errors.telefone && <p className={errorClass}>{vendedorForm.formState.errors.telefone.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Nome da Loja</label>
              <input {...vendedorForm.register('nomeLoja', { required: 'Obrigatório' })} className={inputClass} placeholder="Minha Loja Incrível" />
              {vendedorForm.formState.errors.nomeLoja && <p className={errorClass}>{vendedorForm.formState.errors.nomeLoja.message}</p>}
            </div>
            <button
              type="submit"
              disabled={vendedorForm.formState.isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              {vendedorForm.formState.isSubmitting ? 'Criando...' : 'Criar conta de vendedor'}
            </button>
          </form>
        )}

        <p className="text-center text-gray-500 text-sm mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}
