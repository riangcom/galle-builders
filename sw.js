// Service worker. A versão vem de config.js (CONFIG.VERSAO): aumente a cada mudança.
importScripts("config.js");
const VERSAO = CONFIG.VERSAO;
const CACHE = "plataforma-" + VERSAO;
const ARQUIVOS = ["./", "index.html", "styles.css", "app.js", "config.js", "manifest.webmanifest",
  "icones/icone-192.png", "icones/icone-512.png", "icones/icone-180.png"]
  .concat(CONFIG.KITS.map(k => "dados/" + k.arquivo))
  .concat(["dados/referencias.json"], [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => "referencias/mi-pneus/mi-pneus-0" + n + ".jpg"));

self.addEventListener("install", e => {
  // no-cache: nunca monta o cache novo a partir de cópia velha do navegador
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(ARQUIVOS.map(u => fetch(new Request(u, { cache: "no-cache" })).then(r => {
      if (!r.ok) throw new Error(u + " " + r.status); return c.put(u, r); })))));
  // sem skipWaiting automático: o usuário toca em "atualizar" (mensagem abaixo)
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("plataforma-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("message", e => { if (e.data === "PULAR_ESPERA") self.skipWaiting(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(e.request, { ignoreSearch: true }).then(r => r ||
    fetch(e.request).catch(() => e.request.mode === "navigate" ? c.match("index.html") : Response.error()))));
});
