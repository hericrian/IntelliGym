# IntelliGym

Plataforma de treino inteligente com frontend web, API FastAPI, autenticação Firebase e persistência PostgreSQL no Supabase.

## Arquitetura de produção

| Camada           | Tecnologia                          | Diretório            | Destino                         |
| ---------------- | ----------------------------------- | -------------------- | ------------------------------- |
| Frontend         | React 19 + Vite                     | `apps/web`           | Cloudflare Pages                |
| Backend HTTP     | FastAPI + Uvicorn                   | `apps/api`           | Render `intelligym-api-fastapi` |
| Autenticação     | Firebase Authentication             | configuração externa | Projeto `intelligym-46878`      |
| Banco            | Supabase PostgreSQL + Edge Function | configuração externa | Projeto `gonmdanxptodfdkewcaf`  |
| Mobile           | Expo + React Native                 | `apps/mobile`        | em desenvolvimento              |
| Backend de borda | Cloudflare Workers                  | `apps/worker`        | opcional                        |

- Frontend: <https://intelligym.pages.dev>
- Backend: <https://intelligym-api-fastapi.onrender.com>

## Organização

```text
apps/
  web/       frontend público e aplicação autenticada
  worker/    backend de borda opcional
  mobile/    aplicativo Expo/React Native
  api/       backend oficial FastAPI
packages/
  shared/    contratos TypeScript compartilhados
firebase/    regras de Firestore e Storage
docs/        documentação operacional
```

Frontend e backend são projetos independentes no mesmo monorepo. Cada um possui comandos, configuração e artefato de produção próprios.

## Requisitos e instalação

- Node.js 24+
- npm 11+
- Wrangler 4+
- Python 3.11+ apenas para `apps/api`

```bash
npm install
```

Para incluir a API FastAPI nos comandos gerais, crie e ative o ambiente Python:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r apps/api/requirements.txt
```

Em Linux/macOS, ative com `source .venv/bin/activate`.

Copie `apps/web/.env.example` para `apps/web/.env.local`. Nunca coloque chaves administrativas Firebase ou `SUPABASE_SERVICE_ROLE_KEY` em variáveis `VITE_*`.

## Desenvolvimento separado

```bash
npm run dev:frontend
npm run dev:backend
npm run dev:edge
```

O frontend abre em `http://localhost:5173`. O Worker local usa a porta informada pelo Wrangler.

## Build e validação

```bash
npm run build:frontend
npm run build:backend
npm run build:edge
npm run build:production
npm run lint
npm run test
npm run format:check
```

O build do backend executa um dry run do Wrangler e não publica alterações.

## Variáveis do frontend

Configure no Cloudflare Pages, nos ambientes Production e Preview:

```env
VITE_API_URL=https://intelligym-api-fastapi.onrender.com
VITE_INTELLIGYM_DATA_API_URL=https://gonmdanxptodfdkewcaf.supabase.co/functions/v1/intelligym-data
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Variáveis `VITE_*` são incorporadas ao bundle público e não podem conter segredos.

## Autenticação e dados

O Firebase autentica por e-mail/senha ou Google. O token Firebase é enviado à Edge Function `intelligym-data`, que valida assinatura, emissor e audiência antes de acessar as tabelas `intelligym_*` no Supabase.

As tabelas têm RLS ativado e bloqueiam acesso direto de clientes. A Edge Function é a fronteira para dados privados.

## Deploy independente

```bash
npm run deploy:frontend
npm run deploy:edge
```

O FastAPI é publicado automaticamente pelo Blueprint `render.yaml` depois que os checks da branch principal passam. Os comandos Cloudflare exigem uma sessão Wrangler autenticada. Segredos devem ser configurados no painel, nunca versionados.

## CI

O workflow `.github/workflows/ci.yml` executa lint, tipos, testes, formatação e builds dos dois projetos. Um push não deve ser publicado se alguma etapa falhar.

## Documentação

- [`docs/deployment-env.md`](docs/deployment-env.md)
- [`docs/firebase-google-auth.md`](docs/firebase-google-auth.md)
- [`docs/firebase-roles.md`](docs/firebase-roles.md)
