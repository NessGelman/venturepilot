if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/venturepilot/sw.js', { scope: '/venturepilot/' });
  });
}
