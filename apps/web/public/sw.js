/* IntelliGym service worker
   Três estratégias, cada uma pelo tipo de recurso:
   - navegação (HTML): rede primeiro, cai para o shell em cache quando offline
   - assets com hash no nome (/assets/*): cache primeiro, nunca mudam
   - modelo de visão + ícones: cache primeiro, buscados só na primeira vez

   Regra que vale para todas: um handler de fetch precisa SEMPRE resolver com
   um Response. Se ele resolver com undefined ou rejeitar, o navegador troca a
   página por um erro de rede — o usuário perde o que estava fazendo e não
   recebe nenhuma explicação.
*/

const VERSION = "v4";
const SHELL_CACHE = `intelligym-shell-${VERSION}`;
const ASSET_CACHE = `intelligym-assets-${VERSION}`;
const MODEL_CACHE = `intelligym-models-${VERSION}`;

const SHELL = [
  "/",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/logo.png"
];

const OFFLINE_PAGE = `<!doctype html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>IntelliGym — sem conexão</title>
<style>
  body{margin:0;min-height:100vh;display:grid;place-items:center;padding:24px;
    background:#000;color:#a8a3b3;text-align:center;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
  h1{margin:0 0 8px;font-size:18px;color:#f8f8f8}
  p{margin:0 0 20px;max-width:40ch;font-size:15px;line-height:1.6}
  button{min-height:44px;padding:0 20px;border:0;border-radius:14px;
    background:#9649f3;color:#fff;font:inherit;font-weight:600;cursor:pointer}
</style></head>
<body><div>
  <h1>Sem conexão</h1>
  <p>Não conseguimos carregar esta tela agora. Seus treinos e registros
     salvos continuam neste aparelho.</p>
  <button onclick="location.reload()">Tentar de novo</button>
</div></body></html>`;

function offlineResponse() {
  return new Response(OFFLINE_PAGE, {
    status: 503,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}

function unavailableResponse() {
  return new Response("", { status: 503, statusText: "Offline" });
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // addAll falha inteiro se um item falhar; individualmente é mais tolerante.
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const keep = new Set([SHELL_CACHE, ASSET_CACHE, MODEL_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});

function isHashedAsset(url) {
  return url.pathname.startsWith("/assets/");
}

function isModel(url) {
  return url.pathname.startsWith("/models/") || url.pathname.endsWith(".wasm");
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    // Sem rede e sem cache: 503 explícito, para o chamador tratar. Deixar a
    // promise rejeitar viraria erro de rede na aba inteira.
    return unavailableResponse();
  }
}

/** Cache primeiro, revalidando em segundo plano. */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(SHELL_CACHE);
  const hit = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  if (hit) {
    // Não esperamos a revalidação: ela atualiza o cache para a próxima visita.
    return hit;
  }

  return (await network) ?? unavailableResponse();
}

async function networkFirstDocument(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put("/", response.clone());
    }
    return response;
  } catch {
    const cache = await caches.open(SHELL_CACHE);
    // SPA: qualquer rota é servida pelo mesmo index.html.
    return (await cache.match("/")) ?? offlineResponse();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Runtime do MediaPipe: vem da CDN, mas é guardado para o coach de
  // movimento continuar funcionando offline depois do primeiro uso.
  if (
    url.origin === "https://cdn.jsdelivr.net" &&
    url.pathname.includes("tasks-vision")
  ) {
    event.respondWith(cacheFirst(request, MODEL_CACHE));
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstDocument(request));
    return;
  }

  if (isHashedAsset(url)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (isModel(url)) {
    event.respondWith(cacheFirst(request, MODEL_CACHE));
    return;
  }

  // Resto: ícones, logo, manifest.
  event.respondWith(staleWhileRevalidate(request));
});
