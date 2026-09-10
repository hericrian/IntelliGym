# IntelliGym

IntelliGym e um produto mobile de treino inteligente com foco em personalizacao, seguranca, recuperacao funcional e evolucao de longo prazo. A base atual foi estruturada para crescer como produto real, com app mobile em Expo/React Native, API em FastAPI e separacao clara entre dominio, dados, features e interface.

## Decisao arquitetural

A plataforma mobile continua em Expo + React Native + TypeScript.

Motivos principais:

- menor custo de evolucao sobre a base ja existente;
- ecossistema maduro para camera, autenticacao, notificacoes e pagamentos;
- melhor reaproveitamento com contratos TypeScript e futura integracao com IA;
- menos risco imediato do que reiniciar o projeto em outra stack sem necessidade comprovada.

Detalhes da decisao: [docs/ADR-002-mobile-platform-decision.md](C:/Users/heric/OneDrive/Documentos/IntelliGym/docs/ADR-002-mobile-platform-decision.md)

## Estrutura

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
docs/
.github/workflows/
  ci.yml            # lint, typecheck, testes e formatação em todo push
  deploy-worker.yml # publica a API quando a main muda apps/worker
```

### Frontend e backend

Estão em pastas separadas e são publicados de forma independente:

| Camada   | Pasta             | Onde roda                 | Sobe no push?                                           |
| -------- | ----------------- | ------------------------- | ------------------------------------------------------- |
| Frontend | `apps/web`        | Cloudflare Pages / Vercel | Sim, pela integração Git do provedor                    |
| API      | `apps/worker`     | Cloudflare Workers        | Sim, via `deploy-worker.yml` (exige os segredos abaixo) |
| Banco    | D1 (`intelligym`) | Cloudflare                | Migrações aplicadas no mesmo workflow                   |

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

Para o deploy automático, configure em Settings → Secrets do GitHub:
`CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`. Sem eles o workflow avisa e
não falha.

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
- Python 3.11+

## Configuracao

1. Copie `.env.example` para `.env` quando precisar de configuracao local.
2. Instale as dependencias JavaScript:

```bash
npm install
```

3. Instale as dependencias Python:

```bash
C:\Users\heric\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m pip install -r apps/api/requirements.txt
```

## Desenvolvimento

API:

```bash
npm run dev:api
```

Mobile Expo:

```bash
npm run dev:mobile
```

Web local para validacao rapida:

```bash
cd apps/mobile
npx expo start --web --offline --port 8083
```

## Validacoes

```bash
npm run lint
npm run typecheck
npm run test
npm run format:check
```

## Proximos modulos planejados

- autenticacao e perfil persistido;
- repositorios reais com Supabase;
- pipeline de treino com validacao deterministica antes de aceitar sugestoes de IA;
- assistente por voz;
- analise de movimento por camera;
- paywall e assinatura premium;
- observabilidade e analytics de produto.
