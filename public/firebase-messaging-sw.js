// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDlqlYRMqNcWMPDN9EZDY5ghCYHjKnSLns",
    authDomain: "push-notifications-web-f8891.firebaseapp.com",
    projectId: "push-notifications-web-f8891",
    storageBucket: "push-notifications-web-f8891.firebasestorage.app",
    messagingSenderId: "675831642676",
    appId: "1:675831642676:web:fc72f8d61573c710942861",
    measurementId: "G-KYSDPQ4KXE"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Recibido en background:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
