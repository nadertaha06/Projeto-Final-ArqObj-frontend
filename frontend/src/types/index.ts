export type TipoUsuario = 'CLIENTE' | 'VENDEDOR'

export interface LoginResponse {
  token: string
  tipo: TipoUsuario
  id: number
  email: string
  nome: string
}

export interface Categoria {
  id: number
  nome: string
  descricao: string
}

export interface Estoque {
  id: number
  quantidade: number
  quantidadeMinima: number
}

export interface Produto {
  id: number
  nome: string
  descricao: string
  preco: number
  imagemUrl: string
  ativo: boolean
  categoria: Categoria
  estoque: Estoque
  vendedor: { id: number; nome: string; nomeLoja: string }
}

export interface ProdutoResumo {
  id: number
  nome: string
  preco: number
  imagemUrl: string
}

export interface Endereco {
  id: number
  rua: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export interface ItemCarrinho {
  id: number
  produto: {
    id: number
    nome: string
    preco: number
    imagemUrl: string
    estoque?: {
      quantidade: number
    }
  }
  quantidade: number
}

export interface Carrinho {
  id: number
  itens: ItemCarrinho[]
}

export type StatusPedido =
  | 'AGUARDANDO_PAGAMENTO'
  | 'PAGO'
  | 'EM_PREPARACAO'
  | 'ENVIADO'
  | 'ENTREGUE'
  | 'CANCELADO'

export interface ItemPedido {
  id: number
  produto: ProdutoResumo
  quantidade: number
  precoUnitario: number
}

export interface Pedido {
  id: number
  status: StatusPedido
  valorTotal: number
  dataCriacao: string
  cliente?: {
    id: number
    nome: string
  } | null
  entrega?: {
    id: number
    status: string
    codigoRastreio?: string
    previsaoEntrega?: string
    endereco?: Endereco | null
  } | null
  itens: ItemPedido[]
}

export interface Avaliacao {
  id: number
  nota: number
  comentario: string
  dataCriacao: string
  clienteId?: number
}

export interface Cupom {
  id: number
  codigo: string
  desconto: number
  dataValidade: string
  usoMaximo?: number
  usoAtual?: number
  ativo: boolean
  produtoId: number
}

export interface Entrega {
  id: number
  status: string
  codigoRastreio?: string
  previsaoEntrega?: string
}

export interface Usuario {
  id: number
  nome: string
  email: string
  tipo: TipoUsuario
}
