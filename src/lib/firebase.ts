/** Firebase opcional: sem as variáveis VITE_FIREBASE_* o site roda só com o navegador. */
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

const env = import.meta.env;
const cfg = {
  apiKey: env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const firebaseEnabled = Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);

let cache: Promise<{ app: FirebaseApp; auth: Auth; db: Firestore }> | null = null;

/** Carrega o SDK só quando necessário (não pesa na primeira visita). */
export function fb() {
  if (!firebaseEnabled) return Promise.reject(new Error('Firebase não configurado'));
  if (!cache) {
    cache = (async () => {
      const [{ initializeApp }, { getAuth }, { getFirestore }] = await Promise.all([
        import('firebase/app'),
        import('firebase/auth'),
        import('firebase/firestore'),
      ]);
      const app = initializeApp(cfg as Record<string, string>);
      return { app, auth: getAuth(app), db: getFirestore(app) };
    })();
  }
  return cache;
}
