# Login com Google no IntelliGym

O frontend já contém o fluxo oficial do Firebase Authentication: pop-up em computadores e redirecionamento em celulares. Sem as variáveis abaixo, o produto mostra explicitamente o modo de demonstração e não tenta simular uma conta Google.

## Configuração única no Firebase

1. No [Firebase Console](https://console.firebase.google.com/), crie ou selecione um projeto e registre um aplicativo Web.
2. Em **Authentication > Sign-in method**, habilite **Google** e também **E-mail/senha** se desejar manter esse acesso.
3. Em **Authentication > Settings > Authorized domains**, adicione `intelligym.pages.dev`. Adicione também seu domínio próprio quando ele existir.
4. Em **Project settings > General > Your apps**, copie os seis valores da configuração Web.

## Variáveis no Cloudflare Pages

Em **Workers & Pages > IntelliGym > Settings > Variables and Secrets**, crie estas variáveis tanto para Production quanto Preview e publique novamente:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Esses valores são a configuração pública do aplicativo Web Firebase; não envie chave de conta de serviço, arquivo JSON administrativo, senha pessoal ou token privado.

## Verificação de lançamento

Abra `https://intelligym.pages.dev/login`, escolha **Continuar com Google**, conclua o consentimento e confirme que o usuário chega ao dashboard. Teste também em celular, onde o fluxo usa redirecionamento em vez de pop-up.
