
// put your code here...
self.addEventListener('install', (event) => {
    console.log('Service Worker installed.');
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated.');
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
    console.log('Push event received:', event);

    const data = event.data.json();
    const title = data.title || 'Task Due';
    const options = {
        body: data.body || 'A task is due now!',
        icon: 'icon.png',
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('message', (event) => {
    console.log('Message received in Service Worker:', event.data);
    const { title, body } = event.data;
    self.registration.showNotification(title, { body });
});
