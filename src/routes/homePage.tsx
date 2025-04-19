'use client'

import { useState, useRef, useEffect } from 'react';
import init, { invert_colors, grayscale, blur } from '../../rust-image-lib/pkg/rust_image_lib.js';
import { saveImage, listImages, getImage } from '../db/imagesDB';

export default function Home() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string>('imagen.png');
  const [savedImages, setSavedImages] = useState<{ hash: string; name: string }[]>([]);
  const imageRef = useRef<HTMLImageElement>(null);

  // Inicializar WASM y cargar listado al montar
  useEffect(() => {
    init().catch(console.error);
    fetchSavedImages();
  }, []);

  // Manejar subida de imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      setImageSrc(src);
      setOriginalImage(src);
    };
    reader.readAsDataURL(file);
  };

  // Aplicar filtros via WASM
  const processImage = async (filter: string) => {
    if (!imageRef.current) return;
    if (filter === 'none') {
      originalImage && setImageSrc(originalImage);
      return;
    }

    const img = imageRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    let processed: Uint8ClampedArray;
    switch (filter) {
      case 'invert':
        processed = new Uint8ClampedArray(
          invert_colors(new Uint8Array(imageData.data))
        );
        break;
      case 'grayscale':
        processed = new Uint8ClampedArray(
          grayscale(new Uint8Array(imageData.data))
        );
        break;
      case 'blur':
        processed = new Uint8ClampedArray(
          blur(
            new Uint8Array(imageData.data),
            canvas.width,
            canvas.height,
            5.0
          )
        );
        break;
      default:
        return;
    }

    imageData.data.set(processed);
    ctx.putImageData(imageData, 0, 0);
    setImageSrc(canvas.toDataURL());
  };

  const handleSaveImage = async () => {
    if (!imageSrc) return;
    const res = await fetch(imageSrc);
    const blob = await res.blob();
    const file = new File([blob], imageName, { type: blob.type });
    const hash = await saveImage(file);
    console.log('Guardada con hash:', hash);
    await fetchSavedImages();
  };

  const fetchSavedImages = async () => {
    const all = await listImages();
    setSavedImages(all.map(img => ({ hash: img.hash, name: img.name })));
  };

  const handleLoadImage = async (hash: string) => {
    const blob = await getImage(hash);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    setImageSrc(url);
    setOriginalImage(url);
    setImageName(`${hash}.png`);
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

      <div className="flex justify-center space-x-4 mb-6">
        <button onClick={() => processImage('grayscale')} className="bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-700">
          Blanco y Negro
        </button>
        <button onClick={() => processImage('blur')} className="bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-700">
          Desenfocar
        </button>
        <button onClick={() => processImage('none')} className="bg-blue-400 text-black py-2 px-4 rounded hover:bg-blue-300">
          Quitar Filtros
        </button>
      </div>

      <div className="flex justify-center mb-6">
        <button onClick={handleSaveImage} className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
          💾 Guardar Imagen
        </button>
      </div>

      <div className="max-w-md mx-auto text-left">
        <h2 className="text-2xl font-semibold mb-4">Imágenes Guardadas</h2>
        {savedImages.length === 0 ? (
          <p className="text-black">No hay imágenes guardadas aún.</p>
        ) : (
          <ul className="space-y-2">
            {savedImages.map(img => (
              <li key={img.hash} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span className="truncate text-black">{img.name}</span>
                <button
                  onClick={() => handleLoadImage(img.hash)}
                  className="text-blue-600 hover:underline"
                >
                  Cargar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
