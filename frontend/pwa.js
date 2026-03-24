function registerPWA() {
    // Garante que o navegador suporta Service Workers
    if ('serviceWorker' in navigator) {
        // Adia o registro para depois que a página carregar
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('[PWA] Service Worker registrado com sucesso:', registration);
                })
                .catch(error => {
                    console.error('[PWA] Falha ao registrar Service Worker:', error);
                });
        });
    }
}