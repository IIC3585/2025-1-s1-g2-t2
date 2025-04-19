import { openDB, IDBPDatabase, DBSchema } from 'idb';

const DATABASE_NAME = 'db-images';
const DATABASE_VERSION = 1;
const STORE_NAME = 'images';

export interface ImageDatabaseSchema extends DBSchema {
  images: {
    key: string;
    value: {
      hash: string;
      name: string;
      type: string;
      size: number;
      blob: Blob;
      createdAt: Date;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<ImageDatabaseSchema>>;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<ImageDatabaseSchema>(DATABASE_NAME, DATABASE_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {
            keyPath: 'hash',
          });
        }
      },
    });
  }
  return dbPromise;
};

export async function saveImage(file: File): Promise<string> {
  const db = await getDB();

  const hash = await hashFile(file); // Generamos un hash único

  await db.put(STORE_NAME, {
    hash,
    name: file.name,
    type: file.type,
    size: file.size,
    blob: file,
    createdAt: new Date(),
  });

  return hash;
}

export async function getImage(hash: string): Promise<Blob | null> {
  const db = await getDB();
  const record = await db.get(STORE_NAME, hash);
  return record?.blob ?? null;
}

export async function listImages(): Promise<ImageDatabaseSchema["images"]["value"][]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function deleteImage(hash: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, hash);
}

// Utilidad para obtener hash SHA-256 de un archivo
async function hashFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
