# Fintrack

Gerenciador financeiro pessoal: gastos variáveis (à vista e parcelados), cartões de crédito e despesas fixas.

```
Navegador ──► Next.js (UI + NextAuth/Google + Server Actions) ──JWT──► Spring Boot API ──► MongoDB
```

- **Front-end** (`/frontend`): Next.js 16. Faz o login com Google e chama o backend a partir de Server Actions (`frontend/src/actions/*`), via `frontend/src/lib/backend.ts`.
- **Backend** (`/backend`): Java 21 + Spring Boot 3.5 em Clean Architecture. É o dono das regras de negócio e do acesso ao banco.

## Backend: arquitetura

| Módulo | Conteúdo | Depende de |
|---|---|---|
| `fintrack-domain` | Entidades (`Card`, `Expense`, `FixedExpense`, `User`), regras (`InstallmentSplitPolicy`, `ActiveExpensePolicy`), portas de repositório | nada (Java puro) |
| `fintrack-application` | Casos de uso (`CreateExpense`, `ListActiveExpenses`, `GetMonthlySummary`…) | domain |
| `fintrack-infrastructure` | REST controllers, adapters MongoDB, Spring Security, bootstrap | application |

A regra de dependência é garantida pelos módulos Maven e verificada por testes ArchUnit (`ArchitectureTest`).

### Regras de negócio principais
- Toda leitura e escrita é restrita ao usuário autenticado.
- Gasto no cartão parcelado: na **criação**, o valor informado é dividido pelo número de parcelas. A edição grava o valor como está.
- Dashboard (mês corrente): gastos do mês atual ou futuros, mais os parcelados de meses anteriores enquanto `meses decorridos < parcelas`. O número de parcelas não muda com o tempo (o antigo cron que o decrementava foi removido).
- "Hoje" e "mês corrente" seguem `APP_TIMEZONE` (padrão `America/Sao_Paulo`).

### API (`/api/v1`)
`GET /me` · `GET|POST /cards` · `PUT|DELETE /cards/{id}` · `GET|POST /fixed-expenses` · `PUT|DELETE /fixed-expenses/{id}` · `GET /expenses/active` · `GET /expenses?month=&year=` · `GET /expenses/monthly-summary` · `POST /expenses` · `PUT|DELETE /expenses/{id}` · `GET /actuator/health` (público)

### Autenticação
O servidor Next.js assina, a cada chamada, um JWT HS256 de 5 minutos (`sub` = e-mail, `iss` = `fintrack-web`, `aud` = `fintrack-api`) com o segredo compartilhado `BACKEND_JWT_SECRET`. O backend valida esse token como OAuth2 Resource Server e cadastra o usuário no primeiro acesso. O token nunca chega ao navegador, e o backend deve ficar acessível apenas pela rede privada.

## Variáveis de ambiente

| Variável | Onde | Descrição |
|---|---|---|
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | front | NextAuth |
| `BACKEND_URL` | front | URL do backend (padrão `http://localhost:8080`) |
| `BACKEND_JWT_SECRET` | front **e** backend | segredo compartilhado, mín. 32 caracteres (`openssl rand -base64 48`) |
| `MONGODB_URI` | backend | conexão MongoDB, incluindo o nome do banco |
| `APP_TIMEZONE` | backend | fuso para "hoje"/"mês corrente" (padrão `America/Sao_Paulo`) |

## Rodando localmente

```bash
# 1. MongoDB + backend
export BACKEND_JWT_SECRET="um-segredo-com-pelo-menos-32-caracteres"
docker compose up --build
#    ou, sem Docker para o backend:
cd backend && ./mvnw -pl fintrack-infrastructure -am spring-boot:run

# 2. Front-end (com as variáveis acima em frontend/.env.local)
cd frontend
npm install
npm run dev
```

## Testes

```bash
cd backend && ./mvnw verify   # unitários, ArchUnit, MockMvc e MongoDB via Testcontainers (requer Docker)
cd frontend && npm run build  # front-end
```

## Deploy
`.github/workflows/deploy.yml` roda os testes e, em seguida, atualiza a EC2: build do jar e restart do serviço systemd (`backend/deploy/fintrack-backend.service`), depois build do Next e restart do pm2.
