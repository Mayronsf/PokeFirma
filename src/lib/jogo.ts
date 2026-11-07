/**
 * Leituras AO VIVO (onSnapshot) dos dados que vêm do Minecraft e do perfil público.
 * Quando o jogador ganha uma insígnia ou captura um Pokémon no servidor, a tela atualiza sozinha.
 */
import { useEffect, useState } from 'react';
import { fb, firebaseEnabled } from './firebase';
import type { Treinador } from './jogoTipos';
import type { PublicProfile } from './store';
import type { Team } from './team';

export type { MonJogo, Treinador, Sexo, Stats } from './jogoTipos';

interface Estado<T> {
  data: T | null;
  carregando: boolean;
  /** 'privado' = existe mas o dono deixou o perfil privado; 'erro' = falha de rede. */
  erro: 'privado' | 'erro' | null;
}

/** Time, PC e Pokédex do jogador (treinadores/{uuid}). */
export function useTreinador(uuid: string | null | undefined): Estado<Treinador> {
  const [st, setSt] = useState<Estado<Treinador>>({ data: null, carregando: !!uuid, erro: null });
  useEffect(() => {
    if (!uuid || !firebaseEnabled) {
      setSt({ data: null, carregando: false, erro: null });
      return;
    }
    setSt((s) => ({ ...s, carregando: true }));
    let unsub = () => {};
    let vivo = true;
    fb()
      .then(async ({ db }) => {
        const fs = await import('firebase/firestore');
        if (!vivo) return;
        unsub = fs.onSnapshot(
          fs.doc(db, 'treinadores', uuid),
          (snap) => setSt({ data: snap.exists() ? (snap.data() as Treinador) : null, carregando: false, erro: null }),
          (e) => setSt({ data: null, carregando: false, erro: (e as { code?: string }).code === 'permission-denied' ? 'privado' : 'erro' }),
        );
      })
      .catch(() => setSt({ data: null, carregando: false, erro: 'erro' }));
    return () => {
      vivo = false;
      unsub();
    };
  }, [uuid]);
  return st;
}

/** Perfil público ao vivo + times públicos (lidos uma vez). */
export function usePerfilPublico(nick: string) {
  const [perfil, setPerfil] = useState<PublicProfile | null>(null);
  const [times, setTimes] = useState<Team[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (!firebaseEnabled || !nick) {
      setCarregando(false);
      return;
    }
    setCarregando(true);
    setErro(false);
    let unsub = () => {};
    let vivo = true;
    let uidAtual: string | null = null;
    fb()
      .then(async ({ db }) => {
        const fs = await import('firebase/firestore');
        if (!vivo) return;
        unsub = fs.onSnapshot(
          fs.doc(db, 'publicProfiles', nick.trim().toLowerCase()),
          async (snap) => {
            const p = snap.exists() ? (snap.data() as PublicProfile) : null;
            setPerfil(p);
            setCarregando(false);
            if (p && p.uid !== uidAtual) {
              uidAtual = p.uid;
              const s = await fs.getDocs(fs.query(fs.collection(db, 'users', p.uid, 'teams'), fs.where('publico', '==', true))).catch(() => null);
              if (vivo && s) setTimes(s.docs.map((x) => ({ ...(x.data() as Team), id: x.id })));
            }
            if (!p) setTimes([]);
          },
          () => {
            setErro(true);
            setCarregando(false);
          },
        );
      })
      .catch(() => {
        setErro(true);
        setCarregando(false);
      });
    return () => {
      vivo = false;
      unsub();
    };
  }, [nick, tentativa]);

  return { perfil, times, carregando, erro, retry: () => setTentativa((t) => t + 1) };
}

/** Jogadores verificados (para os seletores do painel). */
export async function listarVerificados(max = 200): Promise<PublicProfile[]> {
  if (!firebaseEnabled) return [];
  const { db } = await fb();
  const fs = await import('firebase/firestore');
  const s = await fs.getDocs(fs.query(fs.collection(db, 'publicProfiles'), fs.where('verificado', '==', true), fs.limit(max)));
  return s.docs.map((d) => d.data() as PublicProfile).sort((a, b) => (a.trainer_id ?? '').localeCompare(b.trainer_id ?? ''));
}
