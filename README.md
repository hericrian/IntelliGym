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
  web/            # frontend React + Vite (PWA instalável) — o produto hoje
    src/
      components/ # componentes reutilizáveis
      contexts/   # sessão (AuthContext) e dados sincronizados (DataContext)
      hooks/
      lib/
        pose/     # coach de movimento: geometria, analisadores por exercício
      pages/      # uma tela por rota
      styles/     # tokens e camadas de CSS
  worker/         # API em Cloudflare Workers + banco D1 — backend em produção
    src/
      auth.ts        # verificação do ID token do Firebase (RS256/WebCrypto)
      repository.ts  # acesso ao D1
    migrations/      # esquema SQL versionado
    test/            # testes de rota rodando SQL real via node:sqlite
  api/            # FastAPI — protótipo anterior, hoje sem uso em produção
  mobile/         # Expo / React Native
packages/
  shared/         # contratos TypeScript compartilhados entre clientes e API
firebase/         # regras de Firestore e Storage
docs/             # documentação operacional
.github/workflows/
  ci.yml     # lint, typecheck, testes e formatação em todo push
  deploy.yml # publica frontend, API e migrações quando a CI passa na main
```

### Frontend e backend

São projetos independentes no mesmo monorepo: cada um tem comandos,
configuração e artefato de produção próprios.

| Camada   | Pasta             | Onde roda          | Sobe a cada commit na main?         |
| -------- | ----------------- | ------------------ | ----------------------------------- |
| Frontend | `apps/web`        | Cloudflare Pages   | Sim, pelo `deploy.yml`              |
| API      | `apps/worker`     | Cloudflare Workers | Sim, pelo `deploy.yml`              |
| Banco    | D1 (`intelligym`) | Cloudflare         | Migrações aplicadas no mesmo job    |
| FastAPI  | `apps/api`        | Render             | Sim, pelo `render.yaml` (protótipo) |

O `deploy.yml` roda **depois** da CI e só quando ela passa: um commit que
quebrou typecheck ou teste não chega em produção. Commits simultâneos são
agrupados, e só o último vai ao ar.

## Banco de dados

A API guarda perfil, equipamentos, planos gerados, registros de dor e sessões
de treino no D1. Cada linha é indexada pelo `uid` do Firebase e a identidade
vem do ID token, verificado a cada requisição — não há endpoint capaz de
devolver dados de outra conta.

Para ligar o banco pela primeira vez:

```bash
# 1. cria o banco e devolve o database_id
npx wrangler d1 create intelligym

# 2. cole o database_id em apps/worker/wrangler.jsonc e preencha
#    FIREBASE_PROJECT_ID com o id do seu projeto Firebase

# 3. aplique o esquema e publique
npm --workspace apps/worker run db:remote
npm --workspace apps/worker run deploy
```

### Segredos do deploy automático

Em Settings → Secrets and variables → Actions:

| Segredo                 | Para quê                                                              |
| ----------------------- | --------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | Publicar Worker e Pages, aplicar migrações                            |
| `CLOUDFLARE_ACCOUNT_ID` | Identificar a conta Cloudflare                                        |
| `VITE_FIREBASE_*` (6)   | Entram no build do frontend; sem eles o app sobe em modo demonstração |

Opcionalmente, a _variable_ `VITE_API_URL` sobrescreve o endereço da API.
Sem `CLOUDFLARE_API_TOKEN` o workflow avisa e termina sem erro, em vez de
falhar o commit.

Enquanto a API não estiver configurada, o app continua utilizável: tudo é
gravado em `localStorage` e o selo de sincronização mostra "Somente neste
aparelho".

## MVP atual

O produto web atual já inclui:

- onboarding que grava objetivo, local, nível e limitações no perfil real;
- PWA instalável no Android, iPhone e desktop, com atalhos e uso offline;
- barra de navegação inferior no celular e áreas seguras respeitadas;
- geração de treino, execução guiada com cronômetro de descanso e registro de dor;
- **coach de movimento**: correção de técnica em tempo real pela câmera, com
  contagem de repetições e esqueleto sobreposto. Roda inteiro no aparelho
  (MediaPipe Pose) — nenhuma imagem é enviada ou gravada;
- sincronização com o banco quando há conta e conexão, com fila de reenvio
  para o que foi feito offline;
- alertas de segurança e limites funcionais visíveis na interface.

## Requisitos

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

O Firebase autentica por e-mail/senha ou Google. O token Firebase é enviado ao FastAPI, que valida assinatura, emissor e audiência com as chaves públicas do Google, sem armazenar uma chave privada de conta de serviço. A Edge Function `intelligym-data` protege o acesso às tabelas `intelligym_*` no Supabase.

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
