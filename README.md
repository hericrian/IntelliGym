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
  api/
  mobile/
    src/
      app/        # shell da aplicacao, fluxo raiz e estado global
      data/       # dados simulados e, futuramente, fontes remotas/locais
      domain/     # modelos e regras puras
      features/   # telas e modulos por caso de uso
      ui/         # componentes e tema compartilhados
packages/
  shared/         # contratos compartilhados entre clientes e API
docs/
  ADR-002-mobile-platform-decision.md
.github/
```

## MVP atual

O MVP atual ja inclui:

- onboarding com perfil demonstracao orientado a fortalecimento de joelho;
- navegacao inferior com cinco abas: Inicio, Treino, Progresso, IA e Perfil;
- dados simulados realistas para treino, progresso, biblioteca e jornada de recuperacao;
- alertas de seguranca e restricoes funcionais visiveis na UX;
- API FastAPI com `GET /health`;
- estrutura pronta para evoluir para autenticacao, banco, IA, camera e assinatura.

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
