# Ambiente de produção

A aplicação web e a API são publicadas separadamente:

- frontend: React/Vite no Cloudflare Pages;
- backend principal: FastAPI no Render;
- autenticação: Firebase Authentication;
- dados e funções protegidas: Supabase;
- Cloudflare Worker em `apps/worker`: serviço de borda opcional.

## Frontend — Cloudflare Pages

Configure as variáveis abaixo no projeto `intelligym`:

```env
VITE_API_URL=https://intelligym-api-fastapi.onrender.com
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_STORE_URL=
VITE_PLAY_STORE_URL=
VITE_APP_DOWNLOAD_URL=
```

Build de produção:

```bash
npm run build:frontend
npm run deploy:frontend
```

## Backend — Render

O serviço `intelligym-api-fastapi` é definido em `render.yaml`. Configure no
painel os valores marcados com `sync: false`:

```env
AI_API_KEY=
```

O deploy é automático após os checks da branch principal passarem.

## Backend de borda opcional — Cloudflare Workers

As variáveis públicas e origens permitidas ficam em
`apps/worker/wrangler.jsonc`. Credenciais nunca devem ser gravadas no Git;
cadastre cada segredo com:

```bash
npx wrangler secret put NOME_DO_SEGREDO --config apps/worker/wrangler.jsonc
```

Validação e publicação:

```bash
npm run build:edge
npm run deploy:edge
```

## Configuração FastAPI

```env
ENVIRONMENT=production
FRONTEND_URL=https://intelligym.pages.dev
BACKEND_CORS_ORIGINS=https://intelligym.pages.dev
FIREBASE_PROJECT_ID=
AI_PROVIDER=gemini
AI_API_KEY=
AI_MODEL=gemini-2.0-flash
```

O backend valida os ID tokens pelas chaves públicas do Google e não precisa de
uma chave privada de conta de serviço.
