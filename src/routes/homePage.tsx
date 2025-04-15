// export default function Home() {
//     return <h1>Inicio</h1>;
//   }

// src/routes/homePage.tsx
// export default function Home() {
//   return (
//     <section className="text-center py-12 px-4">
//       {/* Título principal */}
//       <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600 mb-6">
//         Bienvenido a Image Editor
//       </h1>

//       {/* Introducción */}
//       <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
//       Sube una imagen, escoge un filtro y observa el resultado.
//       </p>

     
 
//     </section>
//   );
// }

// src/routes/homePage.tsx
import { useState, useRef } from 'react';

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => setImageSrc(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const applyFilter = (filter: string) => {
    if (!imageRef.current) return;

    switch (filter) {
      case 'grayscale':
        imageRef.current.style.filter = 'grayscale(100%)';
        break;
      case 'invert':
        imageRef.current.style.filter = 'invert(100%)';
        break;
      default:
        imageRef.current.style.filter = 'none';
    }

    // Aquí iría la logica para invocar las funciones WASM reales
    // como wasmModule.applyFilter(filter);
  };

  return (
    <section className="text-center py-12 px-4">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600 mb-6">
        Bienvenid@ a Image Editor!
      </h1>

      <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
        Sube una imagen, escoge un filtro y observa el resultado :)
      </p>

      <div className="mb-6">
        <label className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow hover:bg-blue-700 cursor-pointer transition">
          👉 Subir Imagen
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      </div>

      {imageSrc && (
        <div className="flex justify-center mb-8">
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Imagen subida"
            className="max-w-full h-auto rounded shadow"
          />
        </div>
      )}

      {imageSrc && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => applyFilter('grayscale')}
            className="bg-blue-800 text-black py-2 px-4 rounded hover:bg-blue-700 transition"
          >

            Blanco y Negro
          </button>
          <button
            onClick={() => applyFilter('invert')}
            className="bg-blue-800 text-black py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Invertir Colores
          </button>
          <button
            onClick={() => applyFilter('none')}
            className="bg-blue-400 text-black py-2 px-4 rounded hover:bg-blue-300 transition"
          >
            Quitar Filtros
          </button>
        </div>
      )}
    </section>
  );
}

