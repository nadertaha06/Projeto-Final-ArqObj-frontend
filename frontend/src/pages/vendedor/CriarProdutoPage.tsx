import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { criarProduto } from '../../api/produtos'
import { listarCategorias, criarCategoria } from '../../api/categorias'
import { criarEstoque } from '../../api/estoques'
import type { Categoria } from '../../types'
import { useAuth } from '../../context/AuthContext'

interface FormData {
  nome: string
  descricao: string
  preco: number
  imagemUrl: string
  categoriaId: number
  quantidade: number
  quantidadeMinima: number
}

export function CriarProdutoPage() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [novaCategoria, setNovaCategoria] = useState(false)
  const [nomeCategoria, setNomeCategoria] = useState('')
  const [descCategoria, setDescCategoria] = useState('')
  const [criandoCategoria, setCriandoCategoria] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>()

  useEffect(() => {
    listarCategorias().then((r) => setCategorias(r.data))
  }, [])

  async function handleCriarCategoria() {
    if (!nomeCategoria.trim()) return
    setCriandoCategoria(true)
    try {
      const res = await criarCategoria(nomeCategoria.trim(), descCategoria.trim())
      const nova = res.data
      setCategorias((prev) => [...prev, nova])
      setValue('categoriaId', nova.id)
      setNovaCategoria(false)
      setNomeCategoria('')
      setDescCategoria('')
      toast.success('Categoria criada!')
    } catch {
      toast.error('Erro ao criar categoria.')
    } finally {
      setCriandoCategoria(false)
    }
  }

  async function onSubmit(data: FormData) {
    if (!usuario) return
    try {
      const prodRes = await criarProduto({
        nome: data.nome,
        descricao: data.descricao,
        preco: Number(data.preco),
        imagemUrl: data.imagemUrl,
        categoria: { id: Number(data.categoriaId) },
        vendedor: { id: usuario.id },
      })
      await criarEstoque(prodRes.data.id, Number(data.quantidade), Number(data.quantidadeMinima))
      toast.success('Produto criado com sucesso!')
      navigate('/vendedor/produtos')
    } catch {
      toast.error('Erro ao criar produto.')
    }
  }

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'
  const errorClass = 'text-red-500 text-xs mt-1'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/vendedor/produtos')} className="text-gray-500 hover:text-gray-700">
            ←
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Novo Produto</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm p-8 space-y-5">
          <div>
            <label className={labelClass}>Nome do produto</label>
            <input {...register('nome', { required: 'Obrigatório' })} className={inputClass} placeholder="Ex: Camiseta Básica" />
            {errors.nome && <p className={errorClass}>{errors.nome.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Descrição</label>
            <textarea
              {...register('descricao', { required: 'Obrigatório' })}
              rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Descreva seu produto..."
            />
            {errors.descricao && <p className={errorClass}>{errors.descricao.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Preço (R$)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('preco', { required: 'Obrigatório', min: { value: 0.01, message: 'Preço deve ser maior que zero' } })}
              className={inputClass}
              placeholder="0.00"
            />
            {errors.preco && <p className={errorClass}>{errors.preco.message}</p>}
          </div>

          <div>
            <label className={labelClass}>URL da imagem</label>
            <input {...register('imagemUrl')} className={inputClass} placeholder="https://..." />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelClass.replace('mb-1', '')}>Categoria</label>
              <button
                type="button"
                onClick={() => setNovaCategoria((v) => !v)}
                className="text-xs text-indigo-600 hover:underline"
              >
                {novaCategoria ? 'Cancelar nova categoria' : '+ Nova categoria'}
              </button>
            </div>

            {novaCategoria ? (
              <div className="border border-indigo-200 rounded-lg p-3 bg-indigo-50 space-y-2">
                <input
                  value={nomeCategoria}
                  onChange={(e) => setNomeCategoria(e.target.value)}
                  className={inputClass}
                  placeholder="Nome da categoria"
                />
                <input
                  value={descCategoria}
                  onChange={(e) => setDescCategoria(e.target.value)}
                  className={inputClass}
                  placeholder="Descrição (opcional)"
                />
                <button
                  type="button"
                  onClick={handleCriarCategoria}
                  disabled={criandoCategoria || !nomeCategoria.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {criandoCategoria ? 'Criando...' : 'Criar categoria'}
                </button>
              </div>
            ) : (
              <>
                <select
                  {...register('categoriaId', { required: 'Selecione uma categoria' })}
                  className={`${inputClass} bg-white`}
                >
                  <option value="">Selecione...</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
                {errors.categoriaId && <p className={errorClass}>{errors.categoriaId.message}</p>}
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Estoque inicial</label>
              <input
                type="number"
                min="0"
                {...register('quantidade', { required: 'Obrigatório', min: { value: 0, message: 'Mínimo 0' } })}
                className={inputClass}
                placeholder="0"
              />
              {errors.quantidade && <p className={errorClass}>{errors.quantidade.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Qtd. mínima</label>
              <input
                type="number"
                min="0"
                {...register('quantidadeMinima', { required: 'Obrigatório', min: { value: 0, message: 'Mínimo 0' } })}
                className={inputClass}
                placeholder="5"
              />
              {errors.quantidadeMinima && <p className={errorClass}>{errors.quantidadeMinima.message}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/vendedor/produtos')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? 'Criando...' : 'Criar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
