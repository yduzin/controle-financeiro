const CACHE_APP = "controle-financeiro-v1";
const ARQUIVOS_APP = ["./", "./index.html", "./style.css", "./index.js", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", (evento) => {
    evento.waitUntil(caches.open(CACHE_APP).then((cache) => cache.addAll(ARQUIVOS_APP)));
    self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
    evento.waitUntil(
        caches.keys().then((nomes) => Promise.all(
            nomes.filter((nome) => nome !== CACHE_APP).map((nome) => caches.delete(nome))
        ))
    );
    self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
    if (evento.request.method !== "GET" || new URL(evento.request.url).origin !== self.location.origin) return;

    evento.respondWith(
        caches.match(evento.request).then((respostaEmCache) => {
            if (respostaEmCache) return respostaEmCache;
            return fetch(evento.request).then((resposta) => {
                if (resposta.ok) {
                    const copia = resposta.clone();
                    caches.open(CACHE_APP).then((cache) => cache.put(evento.request, copia));
                }
                return resposta;
            });
        })
    );
});
