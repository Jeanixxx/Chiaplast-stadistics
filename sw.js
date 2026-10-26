/* Chiaplast PWA: cachea solo la interfaz estática. Nunca almacena respuestas de Supabase/Auth. */
const CACHE_PREFIX = "chiaplast-shell-";
const CACHE_NAME = CACHE_PREFIX + "v1";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./supabase-sync.js",
  "./manifest.webmanifest",
  "./icons/chiaplast.svg"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // No interceptar Supabase, autenticación, realtime websockets ni CDNs externos.
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === "navigate";
  const isStaticAppFile = /\.(?:html|css|js|webmanifest|svg|png|ico)$/i.test(url.pathname);
  if (!isNavigation && !isStaticAppFile) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(request, { cache: "no-store" });
      if (response && response.ok && response.type === "basic") {
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) return cached;
      if (isNavigation) {
        const fallback = await cache.match("./index.html");
        if (fallback) return fallback;
      }
      throw error;
    }
  })());
});