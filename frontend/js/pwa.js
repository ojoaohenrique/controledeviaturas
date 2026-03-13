// PWA Installation and Service Worker Management

let deferredPrompt = null;
let isInstalled = false;

/**
 * Register the service worker
 */
function registerPWA() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("service-worker.js")
            .then((registration) => {
                console.log("[PWA] Service Worker registered:", registration.scope);

                // Check for updates
                registration.addEventListener("updatefound", () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener("statechange", () => {
                        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                            console.log("[PWA] New version available");
                            // Optionally show update notification
                            showUpdateNotification();
                        }
                    });
                });
            })
            .catch((err) => {
                console.error("[PWA] Service Worker registration failed:", err);
            });
    }
}

/**
 * Listen for beforeinstallprompt event
 */
window.addEventListener("beforeinstallprompt", (e) => {
    console.log("[PWA] Install prompt available");
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Store the event for later use
    deferredPrompt = e;

    // Dispatch custom event so UI can show install button
    window.dispatchEvent(new CustomEvent("pwa:installable"));
});

/**
 * Listen for app installed event
 */
window.addEventListener("appinstalled", () => {
    console.log("[PWA] App was installed");
    isInstalled = true;
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent("pwa:installed"));
});

/**
 * Check if app is already installed
 */
function checkInstalled() {
    if (window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true) {
        isInstalled = true;
        return true;
    }
    return false;
}

/**
 * Trigger the install prompt
 * @returns {Promise<boolean>} Whether the app was installed
 */
async function triggerInstall() {
    if (!deferredPrompt) {
        console.log("[PWA] Install prompt not available");
        return false;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User response to install prompt: ${outcome}`);

    // Clear the deferred prompt
    deferredPrompt = null;

    return outcome === "accepted";
}

/**
 * Show update notification
 */
function showUpdateNotification() {
    // Create a simple notification banner
    const banner = document.createElement("div");
    banner.id = "pwa-update-banner";
    banner.innerHTML = `
        <span>Nova versão disponível!</span>
        <button onclick="window.location.reload()">Atualizar</button>
        <button onclick="this.parentElement.remove()">Depois</button>
    `;
    banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #0056b3;
        color: white;
        padding: 12px 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 15px;
        z-index: 9999;
        font-family: system-ui, -apple-system, sans-serif;
    `;
    banner.querySelectorAll("button").forEach(btn => {
        btn.style.cssText = `
            padding: 6px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
        `;
    });
    banner.querySelector("button:first-of-type").style.background = "#28a745";
    banner.querySelector("button:last-of-type").style.background = "rgba(255,255,255,0.2)";
    banner.querySelector("button:last-of-type").style.color = "white";

    document.body.appendChild(banner);
}

/**
 * Request notification permission
 */
async function requestNotificationPermission() {
    if (!("Notification" in window)) {
        console.log("[PWA] Notifications not supported");
        return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
}

/**
 * Send a test notification
 */
function sendTestNotification(title, body) {
    if (Notification.permission === "granted") {
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title || "GML Viaturas", {
                body: body || "Test notification",
                icon: "/icons/icon-192x192.png",
                badge: "/icons/icon-72x72.png",
            });
        });
    }
}

/**
 * Get PWA status information
 */
function getPWAStatus() {
    return {
        isInstalled: checkInstalled(),
        isInstallable: !!deferredPrompt,
        serviceWorkerSupported: "serviceWorker" in navigator,
        standalone: window.matchMedia("(display-mode: standalone)").matches,
    };
}

// Initialize on load
document.addEventListener("DOMContentLoaded", () => {
    checkInstalled();
    console.log("[PWA] Status:", getPWAStatus());
});

