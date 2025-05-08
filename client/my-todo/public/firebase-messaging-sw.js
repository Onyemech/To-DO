importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

console.log('[firebase-messaging-sw.js] Scripts imported successfully');

const firebaseConfig = {
    apiKey: "AIzaSyBbUwS81Bl49AYheXkk6ZUy2dGTyK4bJVY",
    authDomain: "cado-48e0e.firebaseapp.com",
    projectId: "cado-48e0e",
    storageBucket: "cado-48e0e.firebasestorage.app",
    messagingSenderId: "351327022619",
    appId: "1:351327022619:web:8452b8bf81c5cd71ac12be",
    measurementId: "G-EQ6TL67FNE"
};

try {
    firebase.initializeApp(firebaseConfig);
    console.log('[firebase-messaging-sw.js] Firebase app initialized');

    const messaging = firebase.messaging();
    console.log('[firebase-messaging-sw.js] Messaging instance created');

    self.addEventListener('push', (event) => {
        const payload = event.data.json();
        console.log('[firebase-messaging-sw.js] Received background message:', payload);

        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: '/checklist.png'
        };

        event.waitUntil(
            self.registration.showNotification(notificationTitle, notificationOptions)
        );
            event.notification.close();
            const audio = new Audio('notification.mp3');
            audio.play();
    });

} catch (error) {
    console.error('[firebase-messaging-sw.js] Error during initialization:', error);
    throw error;
}