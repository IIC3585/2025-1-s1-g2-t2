// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//       <h1 className="text-3xl font-bold underline">
//         Hello world!
//       </h1>
//     </>
//   )
// }

// export default App


// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 dark:bg-zinc-900 dark:text-white">
      <header className="bg-white dark:bg-zinc-800 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Image Editor</h1>

          {/* Menú para pantallas grandes (siempre visible) */}
          <nav className="hidden sm:flex space-x-4">
            <Link to="/" className="hover:text-blue-500 transition">Inicio</Link>
            <Link to="/about" className="hover:text-blue-500 transition">Acerca de</Link>
          </nav>

          {/* Icono de menú para pantallas pequeñas */}
          <div className="sm:hidden flex items-center">
            <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-600 dark:text-white">
              <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Menú desplegable en pantallas pequeñas */}
        {menuOpen && (
          <nav ref={dropdownRef} className="sm:hidden absolute top-16 right-0 w-full bg-white dark:bg-zinc-800 shadow-md border border-gray-300 dark:border-zinc-700 rounded-md">
            <Link to="/" className="block py-2 px-4 text-gray-700 dark:text-white hover:bg-blue-500 hover:text-white">Inicio</Link>
            <Link to="/about" className="block py-2 px-4 text-gray-700 dark:text-white hover:bg-blue-500 hover:text-white">Acerca de</Link>
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

