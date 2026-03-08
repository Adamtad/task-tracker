const CACHE = "task-tracker-v2";

self.addEventListener("install", (e) => {
  // Activate immediately without waiting for old SW to stop
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(["/", "/index.html", "/manifest.json"]).catch(() => {})
    )
  );
});

self.addEventListener("activate", (e) => {
  // Delete all old caches
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);

  // Network-first for HTML — always loads the latest deployed version
  if (e.request.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname === "/") {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  // Cache-first for hashed JS/CSS assets (filenames change each deploy, so this is safe)
  e.respondWith(
    caches.match(e.request).then(
      (cached) =>
        cached ||
        fetch(e.request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
          return res;
        })
    ).catch(() => caches.match("/index.html"))
  );
});
