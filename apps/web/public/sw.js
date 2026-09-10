/* IntelliGym service worker
   Três estratégias, cada uma pelo tipo de recurso:
   - navegação (HTML): rede primeiro, cai para o shell em cache quando offline
   - assets com hash no nome (/assets/*): cache primeiro, nunca mudam
   - modelo de visão + ícones: cache primeiro, buscados só na primeira vez
*/

const VERSION = "v3";
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

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
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
    return (await cache.match("/")) ?? Response.error();
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

  // Resto (ícones, logo, manifest): cache primeiro com revalidação em segundo plano.
  event.respondWith(
    caches.open(SHELL_CACHE).then(async (cache) => {
      const hit = await cache.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => hit);
      return hit ?? network;
    })
  );
});
