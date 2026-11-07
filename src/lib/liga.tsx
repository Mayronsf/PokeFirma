/**
 * Dados da Liga (ranking + torneios).
 * Ordem de origem: Firestore `liga/dados` (ao vivo, editado no painel /admin)
 *   → rascunho local do painel (só neste navegador, quando não há Firebase)
 *   → arquivo data/liga.json.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import ligaJson from '@data/liga.json';
import { fb, firebaseEnabled } from './firebase';

export * from './ligaTipos';
import type { Jogador, LigaData, Torneio } from './ligaTipos';

export const ligaArquivo: LigaData = (() => {
  const { exemplo, atualizadoEm, jogadores, torneios } = ligaJson as unknown as LigaData;
  return { exemplo, atualizadoEm, jogadores, torneios };
})();

const LS = 'firma:liga-local';

/** A Liga mudou na nuvem (ex.: resultado automático do servidor) desde que o painel começou a editar. */
export class ConflitoLiga extends Error {
  constructor() {
    super('A Liga foi atualizada enquanto você editava.');
  }
}

type Origem = 'nuvem' | 'local' | 'arquivo';
interface Ctx {
  data: LigaData;
  origem: Origem;
  aoVivo: boolean;
  ranking: Jogador[];
  titulosDe: (nick: string) => string[];
  salvar: (d: LigaData) => Promise<Origem>;
  descartarLocal: () => void;
}
const C = createContext<Ctx | null>(null);

function lerLocal(): LigaData | null {
  try {
    const r = localStorage.getItem(LS);
    return r ? (JSON.parse(r) as LigaData) : null;
  } catch {
    return null;
  }
}

export function LigaProvider({ children }: { children: ReactNode }) {
  const local = lerLocal();
  const [data, setData] = useState<LigaData>(local ?? ligaArquivo);
  const [origem, setOrigem] = useState<Origem>(local ? 'local' : 'arquivo');
  const [aoVivo, setAoVivo] = useState(false);

  useEffect(() => {
    if (!firebaseEnabled) return;
    let unsub = () => {};
    fb()
      .then(async ({ db }) => {
        const fs = await import('firebase/firestore');
        unsub = fs.onSnapshot(
          fs.doc(db, 'liga', 'dados'),
          (snap) => {
            if (snap.exists()) {
              setData(snap.data() as LigaData);
              setOrigem('nuvem');
              setAoVivo(true);
            }
          },
          () => setAoVivo(false),
        );
      })
      .catch(() => {});
    return () => unsub();
  }, []);

  const salvar = useCallback(async (d: LigaData): Promise<Origem> => {
    const next = { ...d, atualizadoEm: new Date().toISOString().slice(0, 10) };
    if (firebaseEnabled) {
      const { db } = await fb();
      const fs = await import('firebase/firestore');
      // Transação: se o servidor Minecraft gravou um resultado enquanto o painel editava,
      // não sobrescreve (o painel recebe ConflitoLiga e pede para recarregar).
      const ref = fs.doc(db, 'liga', 'dados');
      await fs.runTransaction(db, async (tx) => {
        const atual = await tx.get(ref);
        const revAtual = atual.exists() ? ((atual.data() as LigaData).rev ?? 0) : 0;
        if (atual.exists() && revAtual !== (d.rev ?? 0)) throw new ConflitoLiga();
        tx.set(ref, JSON.parse(JSON.stringify({ ...next, rev: revAtual + 1 })));
      });
      return 'nuvem';
    }
    try {
      localStorage.setItem(LS, JSON.stringify(next));
    } catch {
      /* ok */
    }
    setData(next);
    setOrigem('local');
    return 'local';
  }, []);

  const descartarLocal = useCallback(() => {
    try {
      localStorage.removeItem(LS);
    } catch {
      /* ok */
    }
    setData(ligaArquivo);
    setOrigem('arquivo');
  }, []);

  const value = useMemo<Ctx>(() => {
    const ranking = [...data.jogadores].sort((a, b) => b.pontos - a.pontos || b.vitorias - a.vitorias);
    const titulosDe = (nick: string) => {
      const n = nick.toLowerCase();
      const j = data.jogadores.find((x) => x.nick.toLowerCase() === n);
      const ids = new Set([...(j?.titulos ?? []), ...data.torneios.filter((t) => t.campeao?.toLowerCase() === n).map((t) => t.id)]);
      return [...ids]
        .map((id) => data.torneios.find((t) => t.id === id))
        .filter((t): t is Torneio => !!t)
        .map((t) => `Campeão da ${t.nome}`);
    };
    return { data, origem, aoVivo, ranking, titulosDe, salvar, descartarLocal };
  }, [data, origem, aoVivo, salvar, descartarLocal]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useLiga() {
  const c = useContext(C);
  if (!c) throw new Error('useLiga fora do LigaProvider');
  return c;
}

const adminCache = new Map<string, Promise<boolean>>();
/** true/false quando souber; null enquanto verifica ou sem login. */
export function useSouAdmin(uid: string | null | undefined): boolean | null {
  const [v, setV] = useState<{ uid: string; ok: boolean } | null>(null);
  useEffect(() => {
    if (!uid || !firebaseEnabled) return;
    let p = adminCache.get(uid);
    if (!p) {
      p = souAdmin(uid);
      adminCache.set(uid, p);
    }
    let vivo = true;
    p.then((ok) => vivo && setV({ uid, ok }));
    return () => {
      vivo = false;
    };
  }, [uid]);
  if (!uid) return false;
  return v && v.uid === uid ? v.ok : null;
}

/** Admin = documento admins/{uid} existe no Firestore (criado à mão no console). */
export async function souAdmin(uid: string): Promise<boolean> {
  if (!firebaseEnabled) return false;
  const { db } = await fb();
  const fs = await import('firebase/firestore');
  const d = await fs.getDoc(fs.doc(db, 'admins', uid)).catch((e) => {
    console.warn('[admin] não consegui ler admins/' + uid, e);
    return null;
  });
  return !!d?.exists();
}
