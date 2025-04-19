/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react';

export interface FileSystemAccessProps {
  imageSrc: string | null;
  imageName: string;
  onLoadImage: (url: string) => void;
}

export default function FileSystemAccess({ imageSrc, imageName, onLoadImage }: FileSystemAccessProps) {
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [fileHandles, setFileHandles] = useState<FileSystemFileHandle[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(fileHandles.length / pageSize);

  const pickDirectory = async () => {
    try {
      const handle = await (window as any).showDirectoryPicker();
      setDirHandle(handle);
      setError(null);
      setFileHandles([]);
      setCurrentPage(1);
      listFiles();
    } catch (_err) {
      setError('No se seleccionó carpeta');
    }
  };

  const saveToDirectory = async () => {
    if (!dirHandle) {
      setError('Primero debes elegir una carpeta');
      return;
    }
    if (!imageSrc) {
      setError('No hay imagen para guardar');
      return;
    }
    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const fileHandle = await dirHandle.getFileHandle(imageName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      setError(null);
      await listFiles();
    } catch (_err) {
      setError('Error al guardar archivo');
    }
  };

  const listFiles = async () => {
    if (!dirHandle) return;
    const handles: FileSystemFileHandle[] = [];
    for await (const entry of (dirHandle as any).values()) {
      if (entry.kind === 'file') handles.push(entry as FileSystemFileHandle);
    }
    setFileHandles(handles);
    setCurrentPage(1);
  };

  const loadFile = async (handle: FileSystemFileHandle) => {
    try {
      const file = await handle.getFile();
      const url = URL.createObjectURL(file);
      onLoadImage(url);
      setError(null);
    } catch (_err) {
      setError('Error al cargar archivo');
    }
  };

  const paginatedFiles = fileHandles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;
  const goPrev = () => canPrev && setCurrentPage(currentPage - 1);
  const goNext = () => canNext && setCurrentPage(currentPage + 1);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [fileHandles, totalPages, currentPage]);

  return (
    <div className="p-4 bg-gray-50 rounded shadow mt-6">
      <h2 className="text-xl font-semibold mb-2 text-black">Carpeta nativa</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="flex space-x-2 mb-4">
        <button onClick={pickDirectory} className="bg-indigo-600 text-black px-3 py-1 rounded">
          📁 Elegir carpeta
        </button>
        <button onClick={saveToDirectory} className="bg-green-600 text-black px-3 py-1 rounded">
          💾 Guardar en carpeta nativa
        </button>
        <button onClick={listFiles} className="bg-yellow-600 text-black px-3 py-1 rounded">
          📂 Listar archivos
        </button>
      </div>

      {dirHandle && (
        <div>
          <h3 className="font-medium mb-2 text-black">Archivos en carpeta:</h3>
          {fileHandles.length === 0 ? (
            <p className="text-gray-500">Sin archivos</p>
          ) : (
            <>
              <ul className="space-y-1">
                {paginatedFiles.map(handle => (
                  <li key={handle.name} className="flex justify-between items-center bg-white p-2 rounded">
                    <span className="truncate text-black">{handle.name}</span>
                    <button onClick={() => loadFile(handle)} className="text-blue-600 hover:underline">
                      Cargar
                    </button>
                  </li>
                ))}
              </ul>

              {/* Paginación */}
              <div className="flex justify-center items-center space-x-4 mt-4">
                <button
                  onClick={goPrev}
                  disabled={!canPrev}
                  className={`px-3 py-1 rounded ${
                    canPrev
                      ? 'bg-gray-200 hover:bg-gray-300'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Anterior
                </button>
                <span className='text-black'>
                  Página {currentPage} / {totalPages}
                </span>
                <button
                  onClick={goNext}
                  disabled={!canNext}
                  className={`px-3 py-1 rounded ${
                    canNext
                      ? 'bg-gray-200 hover:bg-gray-300'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}