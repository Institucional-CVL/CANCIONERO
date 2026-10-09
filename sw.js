/* Service worker · Notas de Alabanza
   Para publicar una versión nueva de la app, cambia el número de VERSION. */
const VERSION='na-v1', LIB='na-lib';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png','icons/favicon-32.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION&&k!==LIB).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin===location.origin){
    const esHtml=r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html');
    if(esHtml){
      /* primero la red (así llegan las actualizaciones); sin internet, la copia guardada */
      e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put('index.html',cp));return res})
        .catch(()=>caches.match('index.html').then(m=>m||caches.match('./'))));
      return;
    }
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{const cp=res.clone();caches.open(VERSION).then(c=>c.put(r,cp));return res})));
    return;
  }
  /* motores de lectura (imagen/PDF/Word): se guardan tras el primer uso */
  if(/(^|\.)(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|tessdata\.projectnaptha\.com|unpkg\.com)$/.test(u.hostname)){
    e.respondWith(caches.open(LIB).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}))));
  }
});
