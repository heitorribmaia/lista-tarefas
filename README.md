# Lista de Tarefas — Aplicação Web com Testes Cypress e CI

Aplicação web completa com **frontend** (HTML, CSS e JavaScript) e **backend**
(JavaScript com **Express.js**), testada de ponta a ponta com **Cypress** e com
**integração contínua (CI)** via **GitHub Actions**.

## Funcionalidades

- Criar, listar, concluir/desfazer e remover tarefas (CRUD completo).
- Interface responsiva e simples.
- API REST com validação de dados e tratamento de erros.

## Tecnologias

| Camada    | Tecnologias                                  |
| --------- | -------------------------------------------- |
| Frontend  | HTML, CSS, JavaScript (sem frameworks)       |
| Backend   | Node.js, Express.js                          |
| Testes    | Cypress (frontend e backend)                 |
| CI        | GitHub Actions (2 workflows)                 |
| Segurança | Helmet, CORS, rate limiting, validação, CSP  |

## Estrutura do projeto

```
lista-tarefas/
├── backend/
│   ├── app.js              # App Express (rotas, segurança, validação)
│   └── server.js           # Inicialização do servidor
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── cypress/
│   ├── e2e/
│   │   ├── backend.cy.js   # Testes da API (cy.request)
│   │   └── frontend.cy.js  # Testes da interface
│   └── support/
│       └── e2e.js
├── .github/workflows/
│   ├── frontend-tests.yml  # Workflow de testes do frontend
│   └── backend-tests.yml   # Workflow de testes do backend
├── cypress.config.js
├── package.json
└── README.md
```

## Como executar localmente

Pré-requisito: **Node.js 18+**.

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar a aplicação
npm start
# Acesse http://localhost:3000
```

## Como rodar os testes

```bash
# Todos os testes (sobe o servidor automaticamente)
npm test

# Apenas frontend
npm run test:frontend

# Apenas backend
npm run test:backend

# Abrir o Cypress no modo interativo
npm start          # em um terminal
npm run cy:open    # em outro terminal
```

## API REST

| Método | Rota                | Descrição                          |
| ------ | ------------------- | ---------------------------------- |
| GET    | `/api/tarefas`      | Lista todas as tarefas             |
| POST   | `/api/tarefas`      | Cria uma tarefa (`{ titulo }`)     |
| PUT    | `/api/tarefas/:id`  | Atualiza título e/ou conclusão     |
| DELETE | `/api/tarefas/:id`  | Remove uma tarefa                  |

## Segurança

O projeto foi estruturado com camadas de segurança:

- **Helmet** — define headers de proteção (CSP, X-Frame-Options, nosniff, etc.).
- **Content-Security-Policy** restritiva (`default-src 'self'`), sem scripts/estilos inline.
- **CORS** controlado por variável de ambiente (`ORIGENS_PERMITIDAS`), fechado por padrão.
- **Rate limiting** na rota `/api` (300 req / 15 min por IP).
- **Validação e sanitização** de entrada (título obrigatório, máx. 120 caracteres).
- **Limite de tamanho** do corpo da requisição (10 KB).
- **Proteção contra XSS** no frontend usando `textContent` (nunca `innerHTML` com dado do usuário).
- **Tratamento de erros** sem vazar *stack trace* ao cliente.

## Integração Contínua (GitHub Actions)

Dois workflows são executados automaticamente a cada `push`:

- **`Testes Frontend`** — roda `cypress/e2e/frontend.cy.js`.
- **`Testes Backend`** — roda `cypress/e2e/backend.cy.js`.

Cada workflow instala as dependências, sobe o servidor e executa o respectivo
conjunto de testes via [`cypress-io/github-action`](https://github.com/cypress-io/github-action).
