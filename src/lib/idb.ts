/** Cache mínimo em IndexedDB (com fallback em memória quando indisponível). */

const DB = 'firma-cache';
const STORE = 'kv';
let dbPromise: Promise<IDBDatabase | null> | null = null;
const memory = new Map<string, unknown>();

function open(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

interface Entry<T> {
  v: T;
  t: number;
}

export async function cacheGet<T>(key: string, maxAgeMs: number): Promise<T | undefined> {
  const mem = memory.get(key) as Entry<T> | undefined;
  if (mem && Date.now() - mem.t < maxAgeMs) return mem.v;
  const db = await open();
  if (!db) return undefined;
  return new Promise((resolve) => {
    try {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
      req.onsuccess = () => {
        const e = req.result as Entry<T> | undefined;
        if (e && Date.now() - e.t < maxAgeMs) {
          memory.set(key, e);
          resolve(e.v);
        } else resolve(undefined);
      };
      req.onerror = () => resolve(undefined);
    } catch {
      resolve(undefined);
    }
  });
}

export async function cacheSet<T>(key: string, v: T): Promise<void> {
  const e: Entry<T> = { v, t: Date.now() };
  memory.set(key, e);
  const db = await open();
  if (!db) return;
  try {
    db.transaction(STORE, 'readwrite').objectStore(STORE).put(e, key);
  } catch {
    /* sem cache persistente */
  }
}
