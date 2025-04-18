// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { requestPermissionAndGetToken, messaging } from './notifications/firebase';
import { onMessage } from 'firebase/messaging';
import toast, { Toaster } from 'react-hot-toast';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Cerrar el dropdown si el usuario hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Solicitar permiso para recibir notificaciones
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await requestPermissionAndGetToken();
        setNotificationPermission(Notification.permission);
      } catch (error) {
        toast.error('Error al configurar notificaciones');
      }
    };
    initializeNotifications();
  
    onMessage(messaging, (payload) => {
      toast(payload.notification?.body || 'Nueva notificación', {
        icon: payload.notification?.image ? 
          <img src={payload.notification.image} className="w-6 h-6 rounded-full"/> : '🔔'
      });
    });
  }, []);

  // Función para mostrar notificación local de prueba
  const showTestNotification = async () => {
    if (notificationPermission !== 'granted') {
      toast.error('Por favor habilita los permisos de notificación primero');
      return;
    }

    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification('Notificación de prueba', {
          body: 'Esta es una notificación local de prueba',
          icon: 'apple-touch-icon.png',
        });
      } catch (error) {
        console.error('Error mostrando notificación:', error);
        toast.error('Error al mostrar notificación');
      }
    } else {
      new Notification('Notificación de prueba', {
        body: 'Esta es una notificación local de prueba',
        icon: 'apple-touch-icon.png'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-zinc-900 dark:text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
          },
        }}
      />
      <header className="bg-white dark:bg-zinc-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Image Editor</h1>

          {/* Menú para pantallas grandes (siempre visible) */}
          <nav className="hidden sm:flex items-center space-x-4">
            <Link to="/" className="hover:text-blue-500 transition">Inicio</Link>            
            {/* Botón de notificaciones */}
            <button
              onClick={showTestNotification}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition relative"
              title="Probar notificación"
              disabled={notificationPermission !== 'granted'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notificationPermission !== 'granted' && (
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              )}
            </button>
          </nav>

          {/* Icono de menú para pantallas pequeñas */}
          <div className="sm:hidden flex items-center space-x-2">
            <button
              onClick={showTestNotification}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
              disabled={notificationPermission !== 'granted'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600 dark:text-white p-2">
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Menú desplegable en pantallas pequeñas */}
        {menuOpen && (
          <nav ref={dropdownRef} className="sm:hidden absolute top-16 right-0 w-full bg-white dark:bg-zinc-800 shadow-md border border-gray-300 dark:border-zinc-700 rounded-md z-50">
            <Link to="/" className="block py-2 px-4 text-gray-700 dark:text-white hover:bg-blue-500 hover:text-white">Inicio</Link>
            <Link to="/about" className="block py-2 px-4 text-gray-700 dark:text-white hover:bg-blue-500 hover:text-white">Acerca de</Link>
            <button 
              onClick={showTestNotification}
              className={`w-full text-left py-2 px-4 text-gray-700 dark:text-white hover:bg-blue-500 hover:text-white flex items-center ${notificationPermission !== 'granted' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={notificationPermission !== 'granted'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Probar notificación
            </button>
          </nav>
        )}
      </header>

      <main className="flex-grow px-4 py-6 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>

      <footer className="bg-white dark:bg-zinc-800 text-center text-sm text-gray-500 py-4">
        © {new Date().getFullYear()} Image Editor. Todos los derechos reservados.
      </footer>
    </div>
  );
}