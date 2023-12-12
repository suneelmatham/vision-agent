console.log('[START] Web worker');

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      console.log("Checking wasm file in cache");
      const cache = await caches.open("web-gpu-wasm");
      const cachedResponse = await cache.match("whisper-webgpu_bg.wasm");

      if (!cachedResponse) {
        console.log("Caching wasm file");
        await cache.add("whisper-webgpu_bg.wasm");
        console.log("Cached wasm file");
      } else {
        console.log("Wasm file is already cached");
      }
    })()
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const wasmUrl = new URL(event.request.url);
      if (
        wasmUrl.pathname ==
        "/_nuxt/node_modules/.cache/vite/client/deps/whisper-webgpu_bg.wasm"
      ) {
        const cachedResponse = await caches.match("/whisper-webgpu_bg.wasm");
        if (cachedResponse) {
          // console.log(event.request);
          console.log("[CACHE] Fetching from cache");
          return cachedResponse;
        }
      }
      return fetch(event.request);
    })()
  );
});