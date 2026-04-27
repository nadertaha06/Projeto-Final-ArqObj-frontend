# ShopApp - Frontend

Aplicação de e-commerce desenvolvida como projeto final da disciplina de Arquitetura de Dados / Objetos no Insper. Marketplace dual-sided com suporte a clientes e vendedores, integrado a uma API REST em Java/Spring Boot.

## Tecnologias

- **React** 19 + **TypeScript** 6
- **Vite** 8 — build e dev server
- **React Router DOM** 7 — roteamento client-side
- **Axios** — cliente HTTP com interceptors de autenticação
- **React Hook Form** — gerenciamento de formulários
- **Tailwind CSS** 3 — estilização utility-first
- **React Hot Toast** — notificações

## Funcionalidades

### Cliente
- Cadastro e login
- Navegação e busca de produtos por nome e categoria
- Carrinho de compras
- Checkout com endereço e múltiplos métodos de pagamento (PIX, Cartão de Crédito, Boleto)
- Aplicação de cupons de desconto
- Histórico e detalhes de pedidos
- Avaliações de produtos

### Vendedor
- Gerenciamento de produtos (criar, editar, excluir)
- Visualização de pedidos recebidos
- Criação e gerenciamento de cupons de desconto

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- Backend rodando em `http://localhost:8080`

## Instalação e execução

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd Projeto-Final-ArqObj-frontend/frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Scripts disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento com HMR |
| `npm run build` | Compila TypeScript e gera o build de produção em `dist/` |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Executa o ESLint |

## Configuração do backend

A URL base da API está definida em `frontend/src/api/axios.ts`:

```ts
const api = axios.create({
  baseURL: 'http://localhost:8080',
})
```

Altere o valor de `baseURL` para apontar para o ambiente desejado.

## Estrutura do projeto

```
frontend/src/
├── api/            # Funções de chamada à API (axios)
│   ├── axios.ts        # Instância configurada com interceptors
│   ├── auth.ts         # Login e cadastro
│   ├── produtos.ts     # CRUD de produtos
│   ├── categorias.ts   # Categorias
│   ├── carrinho.ts     # Carrinho de compras
│   ├── pedidos.ts      # Pedidos
│   ├── pagamentos.ts   # Pagamentos (PIX, Cartão, Boleto)
│   ├── cupons.ts       # Cupons de desconto
│   ├── avaliacoes.ts   # Avaliações de produtos
│   ├── entregas.ts     # Rastreamento de entrega
│   └── estoques.ts     # Estoque
│
├── components/     # Componentes reutilizáveis
│   ├── Navbar.tsx
│   ├── PrivateRoute.tsx
│   ├── ProdutoCard.tsx
│   ├── StarRating.tsx
│   ├── StatusBadge.tsx
│   ├── ConfirmDialog.tsx
│   ├── LoadingSpinner.tsx
│   └── EmptyState.tsx
│
├── context/        # Estado global (Context API)
│   ├── AuthContext.tsx     # Autenticação e sessão
│   └── CarrinhoContext.tsx # Carrinho de compras
│
├── pages/          # Páginas da aplicação
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── CadastroPage.tsx
│   ├── ProdutosPage.tsx
│   ├── ProdutoDetalhePage.tsx
│   ├── CarrinhoPage.tsx
│   ├── CheckoutPage.tsx
│   ├── MeusPedidosPage.tsx
│   ├── PedidoDetalhePage.tsx
│   └── vendedor/
│       ├── MeusProdutosPage.tsx
│       ├── CriarProdutoPage.tsx
│       ├── EditarProdutoPage.tsx
│       ├── PedidosVendedorPage.tsx
│       └── CuponsVendedorPage.tsx
│
├── types/
│   └── index.ts    # Interfaces TypeScript
│
└── App.tsx         # Rotas e providers
```

## Autenticação

A autenticação é baseada em JWT. O token é armazenado em `localStorage` e anexado automaticamente a todas as requisições pelo interceptor do Axios. Sessões expiradas (resposta 401) redirecionam o usuário para o login.

Rotas protegidas por perfil são gerenciadas pelo componente `PrivateRoute`.

## Principais endpoints da API

| Recurso | Endpoint |
|---------|----------|
| Login | `POST /api/auth/login` |
| Cadastro cliente | `POST /api/auth/register/cliente` |
| Cadastro vendedor | `POST /api/auth/register/vendedor` |
| Produtos | `GET/POST /api/produtos` |
| Produto por ID | `GET /api/produtos/:id` |
| Categorias | `GET /api/categorias` |
| Carrinho | `GET /api/carrinho/:clienteId` |
| Pedidos do cliente | `GET /api/pedidos/cliente/:clienteId` |
| Pagamento | `POST /api/pagamentos/pedido/:pedidoId` |
| Avaliações | `GET /api/avaliacoes/produto/:produtoId` |
| Cupons | `POST /api/cupons/validar` |

## Status de pedido

```
AGUARDANDO_PAGAMENTO → PAGO → EM_PREPARACAO → ENVIADO → ENTREGUE
                                                               ↓
                                                          CANCELADO
```

## Autores

Projeto desenvolvido para a disciplina de Arquitetura de Dados / Objetos 
- Nader Taha 
- Ian Caodaglio 
- Davi Homem 
- Prem Bueno 
