const CACHE = "task-tracker-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(["/", "/index.html", "/static/js/main.chunk.js", "/static/js/bundle.js", "/manifest.json"])
        .catch(() => cache.addAll(["/", "/index.html", "/manifest.json"]))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cached) =>
      cached || fetch(e.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
        return res;
      })
    ).catch(() => caches.match("/index.html"))
  );
});
