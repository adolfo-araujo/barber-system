# FSW Barber — Sistema de agendamento para barbearias

Aplicação full stack para encontrar barbearias, ver os serviços e reservar horários.

**Stack:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS + shadcn/ui · Prisma ORM · PostgreSQL · NextAuth (e-mail/senha e Google) · Zod

## Funcionalidades

- **Início:** saudação com o nome do usuário, data de hoje, busca, próximos agendamentos, barbearias recomendadas e populares (ordenadas pelo número de reservas).
- **Busca:** por nome da barbearia, endereço ou serviço (ex.: "barba").
- **Página da barbearia:** dados, endereço e lista de serviços com preço.
- **Reserva:** calendário, horários livres de 45 em 45 minutos (09:00 às 21:00), resumo e confirmação. Horários já reservados ou que já passaram não aparecem.
- **Agendamentos:** reservas confirmadas e finalizadas, detalhes da reserva e cancelamento com confirmação.
- **Contas:** cadastro e login com e-mail e senha (senha com hash bcrypt) e login com Google (opcional).

## Backend

As regras de negócio ficam em `app/_lib/services` e são usadas tanto pelas Server Actions (interface) quanto pela API REST.

| Método | Rota | Descrição | Autenticação |
| --- | --- | --- | --- |
| GET | `/api/health` | Status da aplicação e do banco | — |
| GET | `/api/barbershops?search=` | Lista/busca barbearias | — |
| GET | `/api/barbershops/:id` | Barbearia com serviços | — |
| GET | `/api/barbershops/:id/available-times?date=yyyy-MM-dd` | Horários livres do dia | — |
| POST | `/api/register` | Cria conta `{ name, email, password }` | — |
| GET | `/api/bookings` | Minhas reservas `{ confirmed, finished }` | Sim |
| POST | `/api/bookings` | Cria reserva `{ serviceId, date }` (ISO 8601) | Sim |
| DELETE | `/api/bookings/:id` | Cancela uma reserva futura minha | Sim |
| * | `/api/auth/*` | NextAuth (login, logout, sessão) | — |

Erros sempre retornam `{ "error": "mensagem" }` com o status HTTP adequado (400, 401, 404, 409, 500).

Garantias do backend:

- O usuário da reserva vem **sempre da sessão**, nunca do navegador; a barbearia vem do serviço.
- Só é possível cancelar as **próprias** reservas, e apenas as que ainda não aconteceram.
- O horário precisa estar no expediente e no futuro.
- Reserva duplicada no mesmo horário é bloqueada **no banco** (índice único `barbershopId + date`), inclusive em requisições simultâneas.
- Os horários são calculados no fuso da barbearia (`NEXT_PUBLIC_TIMEZONE`), então funcionam igual em servidores em UTC (ex.: Vercel).

## Banco de dados

PostgreSQL com Prisma. Tabelas: `User`, `Account`, `Session`, `VerificationToken`, `Barbershop`, `Service` e `Booking`. O schema está em `prisma/schema.prisma` e as migrations em `prisma/migrations`.

O seed cria 10 barbearias com 6 serviços cada e um usuário de demonstração:

- **E-mail:** `demo@barber.com`
- **Senha:** `123456`

## Como rodar localmente

Pré-requisitos: Node.js 18.18+ e Docker (ou um PostgreSQL próprio).

```bash
# 1. Instale as dependências
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env
# edite NEXTAUTH_SECRET (gere com: openssl rand -base64 32)

# 3. Suba o PostgreSQL
docker compose up -d

# 4. Crie as tabelas e popule o banco
npx prisma migrate deploy
npm run db:seed

# 5. Rode a aplicação
npm run dev
```

Acesse http://localhost:3000 e entre com `demo@barber.com` / `123456` ou crie sua conta.

### Login com Google (opcional)

1. Crie credenciais OAuth em https://console.cloud.google.com/apis/credentials.
2. Adicione a URI de redirecionamento `http://localhost:3000/api/auth/callback/google` (e a do seu domínio em produção).
3. Preencha `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no `.env`. O botão "Entrar com Google" aparece automaticamente.

## Testes

Com a aplicação rodando e o banco populado:

```bash
bash scripts/smoke-test.sh
```

O script testa a API de ponta a ponta: listagem e busca, horários, cadastro, login, criação de reserva, bloqueio de horário duplicado e de horário no passado, listagem e cancelamento. O mesmo teste roda no GitHub Actions a cada push (`.github/workflows/ci.yml`).

## Deploy (Vercel + banco gerenciado)

1. Crie um banco PostgreSQL (Neon, Supabase, Railway, Vercel Postgres etc.) e copie a URL de conexão.
2. Importe este repositório na Vercel.
3. Configure as variáveis `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (URL do site) e, se quiser, `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
4. Rode uma vez, apontando para o banco de produção: `npx prisma migrate deploy && npm run db:seed`.

## Scripts

| Script | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Cria/aplica migrations em desenvolvimento |
| `npm run db:deploy` | Aplica migrations (produção) |
| `npm run db:seed` | Popula o banco |
| `npm run db:studio` | Abre o Prisma Studio |
