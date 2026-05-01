# Barbearia AJR — Sistema de Agendamento

Sistema web para agendamento de serviços de barbearia, com painel administrativo para o barbeiro e página de reservas para os clientes.

## Tecnologias

**Frontend**
- React 19 + Vite
- React Router DOM v6
- Axios

**Backend**
- Node.js + Express
- SQLite via sql.js (banco de dados em arquivo, sem instalação extra)
- JWT para autenticação
- bcryptjs para hash de senhas

## Estrutura do Projeto

```
ajr/
├── src/                  # Frontend React
│   ├── pages/
│   │   ├── LandingAJR.jsx        # Página inicial pública
│   │   ├── BookingPage.jsx       # Página de agendamento
│   │   ├── AdminLogin.jsx        # Login do administrador
│   │   ├── AdminRegister.jsx     # Cadastro do administrador
│   │   └── AdminDashboard.jsx    # Painel de gerenciamento
│   └── services/
│       └── api.js                # Configuração do Axios
└── backend/
    ├── controllers/              # Lógica de negócio
    ├── routes/                   # Rotas da API
    ├── middleware/                # Autenticação JWT
    ├── database/                 # Inicialização do SQLite
    └── server.js                 # Entrada do servidor
```

## Instalação e Execução

### Pré-requisitos

- Node.js 18+
- npm

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edite o .env com sua JWT_SECRET
npm run dev
```

O servidor sobe em `http://localhost:3001`.

### Frontend

```bash
# Na raiz do projeto
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173`.

## Variáveis de Ambiente

Crie o arquivo `backend/.env` baseado no `backend/.env.example`:

| Variável     | Descrição                         | Padrão |
|--------------|-----------------------------------|--------|
| `PORT`       | Porta do servidor                 | `3001` |
| `JWT_SECRET` | Chave secreta para geração de JWT | —      |

## API — Rotas Principais

| Método | Rota                    | Descrição                        |
|--------|-------------------------|----------------------------------|
| POST   | `/api/auth/register`    | Cadastro de administrador        |
| POST   | `/api/auth/login`       | Login e geração de token JWT     |
| GET    | `/api/barbershop`       | Dados públicos da barbearia      |
| PUT    | `/api/barbershop`       | Atualiza dados (autenticado)     |
| GET    | `/api/appointments`     | Lista agendamentos (autenticado) |
| POST   | `/api/appointments`     | Cria novo agendamento            |
| PUT    | `/api/appointments/:id` | Atualiza agendamento             |
| DELETE | `/api/appointments/:id` | Remove agendamento               |

## Licença

MIT
