# E-Commerce Platform

Uma plataforma de e-commerce moderna construída com Next.js 15, React 19 e TypeScript, focada em performance e experiência do usuário.

## 🚀 Funcionalidades

- **Interface Moderna**: Design responsivo com Tailwind CSS
- **Pagamentos PIX**: Integração com gateways de pagamento brasileiros (BlackCat e HyperCash)
- **Gestão de Produtos**: Sistema completo de catálogo de produtos
- **Carrinho de Compras**: Experiência fluida de checkout
- **Analytics**: Integração com Facebook Pixel para tracking
- **Admin Dashboard**: Painel administrativo para gestão de produtos
- **Testes Automatizados**: Cobertura de testes com Jest
- **Performance**: Otimizado com Next.js 15 e Turbopack

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Query (TanStack Query)
- **Validação**: Zod
- **Testes**: Jest, Testing Library
- **Database**: NocoDB
- **Pagamentos**: BlackCat, HyperCash
- **Analytics**: Facebook Pixel

## 📋 Pré-requisitos

- Node.js 18+ 
- pnpm (recomendado) ou npm
- Conta no NocoDB
- Chaves de API dos gateways de pagamento

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd ecom
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas credenciais.

4. Execute o servidor de desenvolvimento:
```bash
pnpm dev
```

5. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 🧪 Testes

Executar todos os testes:
```bash
pnpm test
```

Executar testes em modo watch:
```bash
pnpm test:watch
```

## 🏗️ Build

Para criar uma build de produção:
```bash
pnpm build
pnpm start
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── api/           # API routes
│   ├── components/    # Componentes React
│   ├── contexts/      # Context providers
│   ├── hooks/         # Custom hooks
│   ├── lib/           # Utilitários
│   ├── types/         # Definições de tipos
│   └── utils/         # Funções utilitárias
├── public/            # Assets estáticos
└── ...
```

## 🔧 Configuração

### Variáveis de Ambiente

Veja o arquivo `.env.example` para todas as variáveis necessárias:

- `NOCO_API_URL`: URL da instância NocoDB
- `NOCO_API_TOKEN`: Token de acesso ao NocoDB
- `BLACKCAT_PUBLIC_KEY`: Chave pública BlackCat
- `BLACKCAT_SECRET_KEY`: Chave secreta BlackCat
- `HYPERCASH_SECRET_KEY`: Chave secreta HyperCash
- `FB_PIXEL_ID`: ID do Facebook Pixel

## 🚀 Deploy

O projeto está otimizado para deploy na Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<url-do-repositorio>)

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou envie um pull request.
