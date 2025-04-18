// firebase.ts
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDlqlYRMqNcWMPDN9EZDY5ghCYHjKnSLns",
  authDomain: "push-notifications-web-f8891.firebaseapp.com",
  projectId: "push-notifications-web-f8891",
  storageBucket: "push-notifications-web-f8891.firebasestorage.app",
  messagingSenderId: "675831642676",
  appId: "1:675831642676:web:fc72f8d61573c710942861",
  measurementId: "G-KYSDPQ4KXE"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Función para registrar el service worker con la ruta correcta
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        '/2025-1-s1-g2-t2/firebase-messaging-sw.js', 
        {
          scope: '/2025-1-s1-g2-t2/firebase-cloud-messaging-push-scope'
        }
      );
      console.log('Service Worker registrado con éxito:', registration);
      return registration;
    } catch (error) {
      console.error('Error al registrar el Service Worker:', error);
      return null;
    }
  }
  return null;
}

export async function requestPermissionAndGetToken() {
  try {
    const registration = await registerServiceWorker();
    
    if (!registration) {
      throw new Error('No se pudo registrar el Service Worker');
    }

    const token = await getToken(messaging, {
      vapidKey: 'BOEvyXJnUftg_yKfrF2TSK-94lGRMkwMLtazQ9EMHO9UoViOsrl3RbHNSLOBzUv-ebcKFIzVOkdnp4q1SF1GO_E',
      serviceWorkerRegistration: registration
    });

    if (token) {
      console.log('FCM Token:', token);
      return token;
    } else {
      console.warn('No se obtuvo token.');
    }
  } catch (err) {
    console.error('Error al obtener token:', err);
  }
}

onMessage(messaging, (payload) => {
  console.log('Mensaje recibido en foreground:', payload);
  alert(`Notificación: ${payload.notification?.title}`);
});