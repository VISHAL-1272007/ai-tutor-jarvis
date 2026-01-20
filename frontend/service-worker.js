const CACHE_NAME = 'jarvis-v2';
const STATIC_CACHE = 'jarvis-static-v2';
const DYNAMIC_CACHE = 'jarvis-dynamic-v2';

// Core assets that must be cached for offline use
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/style-pro.css',
    '/global-pro.css',
    '/jarvis-welcome.css',
    '/script.js',
    '/voice-control.js',
    '/master-ai-engine.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// External assets (cache if available)
const EXTERNAL_ASSETS = [
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    console.log('🤖 JARVIS: Installing service worker...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('📦 JARVIS: Caching core assets');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    console.log('🚀 JARVIS: Activating service worker...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cache) => cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE)
                        .map((cache) => {
                            console.log('🧹 JARVIS: Removing old cache:', cache);
                            return caches.delete(cache);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch Strategy: Stale-While-Revalidate for better performance
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Skip API calls - always go to network
    if (url.pathname.includes('/api/') || url.hostname.includes('render.com') || url.hostname.includes('googleapis.com')) {
        return;
    }
    
    // For navigation requests (HTML pages)
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request) || caches.match('/index.html'))
        );
        return;
    }
    
    // For other requests: Stale-While-Revalidate
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                const fetchPromise = fetch(request)
                    .then((networkResponse) => {
                        // Only cache http/https responses, not chrome-extension or other schemes
                        if (networkResponse && networkResponse.status === 200 && 
                            request.url.startsWith('http')) {
                            const clone = networkResponse.clone();
                            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone))
                                .catch(() => {}); // Silently ignore cache errors
                        }
                        return networkResponse;
                    })
                    .catch(() => cachedResponse);
                
                return cachedResponse || fetchPromise;
            })
    );
});

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data?.text() || 'New update from JARVIS AI',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [100, 50, 100],
        data: { url: '/' }
    };
    
    event.waitUntil(
        self.registration.showNotification('JARVIS AI', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});

// Background sync (for offline messages)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-messages') {
        console.log('🔄 JARVIS: Syncing offline messages...');
    }
});

console.log('🤖 JARVIS Service Worker loaded!');
