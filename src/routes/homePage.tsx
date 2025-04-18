
import { useState, useRef, useEffect } from 'react';
import init, { invert_colors } from '../../rust-image-lib/pkg/rust_image_lib.js';
import { grayscale } from '../../rust-image-lib/pkg/rust_image_lib.js';
import { blur } from '../../rust-image-lib/pkg/rust_image_lib.js';

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null); // Imagen actual
  const [originalImage, setOriginalImage] = useState<string | null>(null); // Imagen original
  const imageRef = useRef<HTMLImageElement>(null);

  // Inicializa WebAssembly al cargar el componente
  useEffect(() => {
    init().catch(console.error);
  }, []);

  // Maneja la carga de la imagen y guarda original y mostrada
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const src = e.target?.result as string;
        setImageSrc(src);
        setOriginalImage(src);  // Guardar la original para restaurar luego
      };
      reader.readAsDataURL(file);
    }
  };

  // Procesa la imagen con filtros de WebAssembly
  const processImage = async (filter: string) => {
    if (!imageRef.current) return;

    // Si el filtro es "none", restaura la imagen original
    if (filter === 'none') {
      if (originalImage) {
        setImageSrc(originalImage);
      }
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let processedPixels: Uint8ClampedArray | undefined;

    switch (filter) {
      case 'invert':
        processedPixels = new Uint8ClampedArray(
          invert_colors(new Uint8Array(imageData.data))
        );
        break;

      case 'grayscale':
        processedPixels = new Uint8ClampedArray(
          grayscale(new Uint8Array(imageData.data))
        );
        break;

      case 'blur':
        processedPixels = new Uint8ClampedArray(
          blur(new Uint8Array(imageData.data), canvas.width, canvas.height, 5.0) // sigma ajustable
        );
        break;

      default:
        return;
    }

    if (processedPixels) {
      imageData.data.set(processedPixels);
      ctx.putImageData(imageData, 0, 0);
      setImageSrc(canvas.toDataURL()); // Actualizar la imagen renderizada
    }
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
            onClick={() => processImage('grayscale')}
            className="bg-blue-800 text-black py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Blanco y Negro
          </button>
          {/* <button
            onClick={() => processImage('invert')}
            className="bg-blue-800 text-black py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Invertir Colores
          </button> */}
          <button
            onClick={() => processImage('blur')}
            className="bg-blue-800 text-black py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Desenfocar (Blur)
          </button>
          <button
            onClick={() => processImage('none')}
            className="bg-blue-400 text-black py-2 px-4 rounded hover:bg-blue-300 transition"
          >
            Quitar Filtros
          </button>
        </div>
      )}
    </section>
  );
}
