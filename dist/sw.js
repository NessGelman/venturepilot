if (!self.define) {
  let s,
    e = {};
  const l = (l, r) => (
    (l = new URL(l + '.js', r).href),
    e[l] ||
      new Promise((e) => {
        if ('document' in self) {
          const s = document.createElement('script');
          ((s.src = l), (s.onload = e), document.head.appendChild(s));
        } else ((s = l), importScripts(l), e());
      }).then(() => {
        let s = e[l];
        if (!s) throw new Error(`Module ${l} didn’t register its module`);
        return s;
      })
  );
  self.define = (r, n) => {
    const i = s || ('document' in self ? document.currentScript.src : '') || location.href;
    if (e[i]) return;
    let t = {};
    const u = (s) => l(s, i),
      o = { module: { uri: i }, exports: t, require: u };
    e[i] = Promise.all(r.map((s) => o[s] || u(s))).then((s) => (n(...s), t));
  };
}
define(['./workbox-8c29f6e4'], function (s) {
  'use strict';
  (self.skipWaiting(),
    s.clientsClaim(),
    s.precacheAndRoute(
      [
        { url: 'registerSW.js', revision: '55798ec1c7764d09204bf3c846b9cb20' },
        { url: 'index.html', revision: '8da01609c913547c1b3cc3f467574665' },
        { url: '404.html', revision: 'f0947441a10123c21476977091739d61' },
        { url: 'assets/trending-up-Btgm6ReA.js', revision: null },
        { url: 'assets/sparkles-DREX6ATt.js', revision: null },
        { url: 'assets/send-tZNj7Uv4.js', revision: null },
        { url: 'assets/plus-Ctp3jOZ5.js', revision: null },
        { url: 'assets/index-PNNBx065.css', revision: null },
        { url: 'assets/index-B2EmCfoI.js', revision: null },
        { url: 'assets/gauge-DCu4LFWg.js', revision: null },
        { url: 'assets/filter-C99f0AWK.js', revision: null },
        { url: 'assets/download-BURqeqWS.js', revision: null },
        { url: 'assets/circle-check-g_dQwaqI.js', revision: null },
        { url: 'assets/Strategy-BY_QYMoO.js', revision: null },
        { url: 'assets/Shared-DyREwVhw.js', revision: null },
        { url: 'assets/PitchDeck-D00GBq5k.js', revision: null },
        { url: 'assets/MarketBench-3NdhHsmp.js', revision: null },
        { url: 'assets/InvestorMatch-B5RFZmmd.js', revision: null },
        { url: 'assets/Dashboard-eneSHCzT.js', revision: null },
        { url: 'assets/BusinessPlan-DlCLty6c.js', revision: null },
        { url: 'assets/BarChart-20HR8_NV.js', revision: null },
        { url: 'manifest.webmanifest', revision: '478369a0330ce9ccd4c0df38a388b52e' },
      ],
      {},
    ),
    s.cleanupOutdatedCaches(),
    s.registerRoute(new s.NavigationRoute(s.createHandlerBoundToURL('index.html'))));
});
