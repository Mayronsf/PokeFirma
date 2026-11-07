/**
 * Base das funções da Vercel (pasta /api). Arquivos começando com "_" não viram rotas.
 *
 * Variáveis de ambiente (Vercel → Settings → Environment Variables):
 *   FIREBASE_SERVICE_ACCOUNT  JSON da conta de serviço do Firebase (texto puro ou base64).
 *                             Firebase → Configurações do projeto → Contas de serviço → Gerar nova chave privada.
 *   MINECRAFT_SECRET          Segredo compartilhado com o servidor Minecraft (header X-Minecraft-Secret).
 */
import { timingSafeEqual } from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let app: App | null = null;
function adminApp(): App {
  if (app) return app;
  if (getApps().length) return (app = getApps()[0]);
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new ErroHttp(500, 'FIREBASE_SERVICE_ACCOUNT não configurada na Vercel.');
  const texto = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  const conta = JSON.parse(texto);
  app = initializeApp({ credential: cert(conta), projectId: conta.project_id });
  return app;
}
export const db = () => getFirestore(adminApp());
export const auth = () => getAuth(adminApp());

export class ErroHttp extends Error {
  constructor(
    public status: number,
    msg: string,
  ) {
    super(msg);
  }
}

/** Confere o header X-Minecraft-Secret em tempo constante. */
export function exigirSegredo(req: VercelRequest) {
  const esperado = process.env.MINECRAFT_SECRET;
  if (!esperado) throw new ErroHttp(500, 'MINECRAFT_SECRET não configurada na Vercel.');
  const veio = String(req.headers['x-minecraft-secret'] ?? '');
  const a = Buffer.from(veio);
  const b = Buffer.from(esperado);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new ErroHttp(401, 'Segredo inválido.');
}

/** Confere o login do site (Firebase ID token no header Authorization: Bearer ...). */
export async function exigirUsuario(req: VercelRequest) {
  const h = String(req.headers.authorization ?? '');
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) throw new ErroHttp(401, 'Faça login para continuar.');
  try {
    return await auth().verifyIdToken(token);
  } catch {
    throw new ErroHttp(401, 'Sessão expirada. Entre de novo.');
  }
}

export function corpo(req: VercelRequest): Record<string, unknown> {
  const b = req.body;
  if (b && typeof b === 'object') return b as Record<string, unknown>;
  if (typeof b === 'string') {
    try {
      return JSON.parse(b);
    } catch {
      /* cai no erro abaixo */
    }
  }
  throw new ErroHttp(400, 'Corpo JSON inválido.');
}

/** Envolve o handler: só POST, erros viram JSON { ok:false, erro }. */
export function rota(fn: (req: VercelRequest, res: VercelResponse) => Promise<unknown>) {
  return async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ ok: false, erro: 'Use POST.' });
    }
    try {
      const r = await fn(req, res);
      if (!res.headersSent) res.status(200).json({ ok: true, ...(r as object) });
    } catch (e) {
      const status = e instanceof ErroHttp ? e.status : 500;
      if (status === 500) console.error(e);
      res.status(status).json({ ok: false, erro: e instanceof Error ? e.message : 'Erro interno.' });
    }
  };
}

/* ---------- validação simples ---------- */
export const texto = (v: unknown, campo: string, max = 64): string => {
  if (typeof v !== 'string' || !v.trim()) throw new ErroHttp(400, `Campo "${campo}" obrigatório.`);
  return v.trim().slice(0, max);
};
export const textoOpc = (v: unknown, max = 64): string | null => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
export const inteiro = (v: unknown, min = 0, max = 1e9): number | null => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.round(n))) : null;
};
export const listaDex = (v: unknown, max = 6): number[] =>
  Array.isArray(v) ? v.map((x) => inteiro(x, 1, 2000)).filter((x): x is number => x !== null).slice(0, max) : [];

export const uuidValido = (v: unknown, campo: string) => {
  const u = texto(v, campo, 40).toLowerCase();
  if (!/^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/.test(u)) throw new ErroHttp(400, `"${campo}" não é um UUID válido.`);
  // padroniza com hífens
  const s = u.replace(/-/g, '');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
};
export const nickValido = (v: unknown, campo = 'nick') => {
  const n = texto(v, campo, 16);
  if (!/^[A-Za-z0-9_]{3,16}$/.test(n)) throw new ErroHttp(400, `"${campo}" não é um nick do Minecraft válido.`);
  return n;
};
/** Token do /vincular: letras/números, com ou sem o prefixo FIRMA-. */
export const normalizarToken = (v: unknown) => {
  const t = texto(v, 'token', 32)
    .toUpperCase()
    .replace(/\s+/g, '');
  if (!/^[A-Z0-9-]{4,20}$/.test(t)) throw new ErroHttp(400, 'Token inválido.');
  return t;
};
