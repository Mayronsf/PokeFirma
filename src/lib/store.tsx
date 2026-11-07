/**
 * Estado do usuário: perfil + times.
 * Sem login → localStorage (mesma estrutura do Firestore). Com login → Firestore:
 *   users/{uid}                  perfil privado
 *   users/{uid}/teams/{teamId}   times
 *   publicProfiles/{nickLower}   vitrine pública (/jogador/{nick})
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Chapter } from '../config';
import { fb, firebaseEnabled } from './firebase';
import type { Team } from './team';

export interface Profile {
  nick: string;
  bio: string;
  favorito: number | null;
  capitulo: Chapter;
  insignias: string[];
  perfilPublico: boolean;
  /** Textura da skin enviada pelo jogador (data URL .png). Vazio = usa a skin do nick. */
  skin?: string;
  /** Id do time principal (um dos times do jogador). */
  timePrincipal?: string;
}

export interface TimeResumo {
  id: string;
  nome: string;
  formato: string;
  pokemon: { dex: number; especie: string; shiny: boolean }[];
}

export const perfilVazio: Profile = { nick: '', bio: '', favorito: null, capitulo: 1, insignias: [], perfilPublico: true };

export interface User {
  uid: string;
  nome: string;
  foto: string | null;
  email: string | null;
}

interface Ctx {
  pronto: boolean;
  user: User | null;
  firebaseEnabled: boolean;
  profile: Profile;
  teams: Team[];
  localTeamsPendentes: number;
  entrar: () => Promise<void>;
  sair: () => Promise<void>;
  excluirConta: () => Promise<void>;
  salvarPerfil: (p: Partial<Profile>) => Promise<void>;
  salvarTime: (t: Team) => Promise<void>;
  excluirTime: (id: string) => Promise<void>;
  enviarParaNuvem: () => Promise<number>;
  erro: string | null;
  limparErro: () => void;
}

const C = createContext<Ctx | null>(null);

const LS_PERFIL = 'firma:perfil';
const LS_TIMES = 'firma:times';

function lsGet<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* armazenamento indisponível */
  }
}

const nickKey = (n: string) => n.trim().toLowerCase();

export function StoreProvider({ children }: { children: ReactNode }) {
  const [pronto, setPronto] = useState(!firebaseEnabled);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(() => ({ ...perfilVazio, ...lsGet(LS_PERFIL, {}) }));
  const [teams, setTeams] = useState<Team[]>(() => lsGet<Team[]>(LS_TIMES, []));
  const [localTeamsPendentes, setPend] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const userRef = useRef<User | null>(null);
  userRef.current = user;
  const teamsRef = useRef<Team[]>(teams);
  teamsRef.current = teams;

  // Observa o login
  useEffect(() => {
    if (!firebaseEnabled) return;
    let unsub = () => {};
    fb()
      .then(async ({ auth, db }) => {
        const { onAuthStateChanged } = await import('firebase/auth');
        const fs = await import('firebase/firestore');
        unsub = onAuthStateChanged(auth, async (u) => {
          if (!u) {
            setUser(null);
            setProfile({ ...perfilVazio, ...lsGet(LS_PERFIL, {}) });
            setTeams(lsGet<Team[]>(LS_TIMES, []));
            setPend(0);
            setPronto(true);
            return;
          }
          setUser({ uid: u.uid, nome: u.displayName ?? '', foto: u.photoURL, email: u.email });
          try {
            const snap = await fs.getDoc(fs.doc(db, 'users', u.uid));
            const cloud = snap.exists() ? (snap.data() as Partial<Profile>) : {};
            setProfile({ ...perfilVazio, ...cloud });
            const ts = await fs.getDocs(fs.collection(db, 'users', u.uid, 'teams'));
            setTeams(ts.docs.map((d) => ({ ...(d.data() as Team), id: d.id })).sort((a, b) => b.atualizadoEm - a.atualizadoEm));
            setPend(lsGet<Team[]>(LS_TIMES, []).length);
          } catch (e) {
            setErro('Não consegui carregar seus dados da nuvem. Verifique a conexão e recarregue.');
          }
          setPronto(true);
        });
      })
      .catch(() => setPronto(true));
    return () => unsub();
  }, []);

  const entrar = useCallback(async () => {
    if (!firebaseEnabled) {
      setErro('Login indisponível: o Firebase ainda não foi configurado neste site.');
      return;
    }
    const { auth } = await fb();
    const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e: unknown) {
      const code = (e as { code?: string }).code;
      if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request')
        setErro('Não foi possível entrar com o Google. Tente de novo.');
    }
  }, []);

  const sair = useCallback(async () => {
    if (!firebaseEnabled) return;
    const { auth } = await fb();
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
  }, []);

  const salvarPublico = useCallback(async (p: Profile, anterior?: Profile) => {
    const u = userRef.current;
    if (!u) return;
    const { db } = await fb();
    const fs = await import('firebase/firestore');
    if (anterior?.nick && nickKey(anterior.nick) !== nickKey(p.nick)) {
      await fs.deleteDoc(fs.doc(db, 'publicProfiles', nickKey(anterior.nick))).catch(() => {});
    }
    if (!p.nick) return;
    const ref = fs.doc(db, 'publicProfiles', nickKey(p.nick));
    if (p.perfilPublico) {
      await fs.setDoc(ref, {
        uid: u.uid, nick: p.nick, bio: p.bio, favorito: p.favorito, capitulo: p.capitulo, insignias: p.insignias, skin: p.skin || null,
        timePrincipal: resumoDe(teamsRef.current.find((t) => t.id === p.timePrincipal)),
      });
    } else {
      await fs.deleteDoc(ref).catch(() => {});
    }
  }, []);

  const salvarPerfil = useCallback(
    async (patch: Partial<Profile>) => {
      const anterior = profile;
      const next = { ...profile, ...patch };
      setProfile(next);
      const u = userRef.current;
      if (!u) {
        lsSet(LS_PERFIL, next);
        return;
      }
      try {
        if (patch.nick !== undefined && patch.nick && nickKey(patch.nick) !== nickKey(anterior.nick)) {
          const { db } = await fb();
          const fs = await import('firebase/firestore');
          const taken = await fs.getDoc(fs.doc(db, 'publicProfiles', nickKey(patch.nick)));
          if (taken.exists() && taken.data().uid !== u.uid) {
            setProfile(anterior);
            setErro(`O nick ${patch.nick} já está ligado a outra conta.`);
            return;
          }
        }
        const { db } = await fb();
        const fs = await import('firebase/firestore');
        await fs.setDoc(fs.doc(db, 'users', u.uid), JSON.parse(JSON.stringify(next)), { merge: true });
        await salvarPublico(next, anterior);
      } catch {
        setErro('Não consegui salvar o perfil na nuvem.');
      }
    },
    [profile, salvarPublico],
  );

  const salvarTime = useCallback(
    async (t: Team) => {
      const team = { ...t, atualizadoEm: Date.now(), autorNick: profile.nick || undefined };
      setTeams((prev) => {
        const i = prev.findIndex((x) => x.id === team.id);
        const next = i >= 0 ? prev.map((x) => (x.id === team.id ? team : x)) : [team, ...prev];
        if (!userRef.current) lsSet(LS_TIMES, next);
        return next;
      });
      const u = userRef.current;
      if (!u) return;
      try {
        const { db } = await fb();
        const fs = await import('firebase/firestore');
        const clean = JSON.parse(JSON.stringify({ ...team, autorUid: u.uid, autorNick: profile.nick || '' }));
        await fs.setDoc(fs.doc(db, 'users', u.uid, 'teams', team.id), clean);
        if (profile.timePrincipal === team.id) setTimeout(() => salvarPublico(profile).catch(() => {}), 0);
      } catch {
        setErro('Não consegui salvar o time na nuvem. Ele continua aberto aqui; tente de novo.');
      }
    },
    [profile, salvarPublico],
  );

  const excluirTime = useCallback(async (id: string) => {
    setTeams((prev) => {
      const next = prev.filter((x) => x.id !== id);
      if (!userRef.current) lsSet(LS_TIMES, next);
      return next;
    });
    const u = userRef.current;
    if (!u) return;
    const { db } = await fb();
    const fs = await import('firebase/firestore');
    await fs.deleteDoc(fs.doc(db, 'users', u.uid, 'teams', id)).catch(() => setErro('Não consegui excluir o time na nuvem.'));
  }, []);

  const enviarParaNuvem = useCallback(async () => {
    const u = userRef.current;
    if (!u) return 0;
    const locais = lsGet<Team[]>(LS_TIMES, []);
    const localPerfil = lsGet<Partial<Profile>>(LS_PERFIL, {});
    const { db } = await fb();
    const fs = await import('firebase/firestore');
    for (const t of locais) {
      const team = JSON.parse(JSON.stringify({ ...t, autorUid: u.uid, autorNick: profile.nick || '' }));
      await fs.setDoc(fs.doc(db, 'users', u.uid, 'teams', t.id), team);
    }
    setTeams((prev) => {
      const ids = new Set(prev.map((x) => x.id));
      return [...locais.filter((t) => !ids.has(t.id)), ...prev];
    });
    // Perfil local completa o que estiver vazio na nuvem
    const patch: Partial<Profile> = {};
    if (!profile.nick && localPerfil.nick) patch.nick = localPerfil.nick;
    if (!profile.bio && localPerfil.bio) patch.bio = localPerfil.bio;
    if (!profile.favorito && localPerfil.favorito) patch.favorito = localPerfil.favorito;
    if (!profile.insignias.length && localPerfil.insignias?.length) patch.insignias = localPerfil.insignias;
    if (Object.keys(patch).length) await salvarPerfil(patch);
    try {
      localStorage.removeItem(LS_TIMES);
    } catch {
      /* ok */
    }
    setPend(0);
    return locais.length;
  }, [profile, salvarPerfil]);

  const excluirConta = useCallback(async () => {
    const u = userRef.current;
    if (!u) {
      try {
        localStorage.removeItem(LS_PERFIL);
        localStorage.removeItem(LS_TIMES);
      } catch {
        /* ok */
      }
      setProfile(perfilVazio);
      setTeams([]);
      return;
    }
    const { db, auth } = await fb();
    const fs = await import('firebase/firestore');
    const authMod = await import('firebase/auth');
    const ts = await fs.getDocs(fs.collection(db, 'users', u.uid, 'teams'));
    await Promise.all(ts.docs.map((d) => fs.deleteDoc(d.ref)));
    if (profile.nick) await fs.deleteDoc(fs.doc(db, 'publicProfiles', nickKey(profile.nick))).catch(() => {});
    await fs.deleteDoc(fs.doc(db, 'users', u.uid));
    const cur = auth.currentUser;
    if (cur) {
      try {
        await authMod.deleteUser(cur);
      } catch (e: unknown) {
        if ((e as { code?: string }).code === 'auth/requires-recent-login') {
          await authMod.reauthenticateWithPopup(cur, new authMod.GoogleAuthProvider());
          await authMod.deleteUser(cur);
        } else throw e;
      }
    }
  }, [profile.nick]);

  const value = useMemo<Ctx>(
    () => ({
      pronto, user, firebaseEnabled, profile, teams, localTeamsPendentes,
      entrar, sair, excluirConta, salvarPerfil, salvarTime, excluirTime, enviarParaNuvem,
      erro, limparErro: () => setErro(null),
    }),
    [pronto, user, profile, teams, localTeamsPendentes, entrar, sair, excluirConta, salvarPerfil, salvarTime, excluirTime, enviarParaNuvem, erro],
  );
  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useStore() {
  const c = useContext(C);
  if (!c) throw new Error('useStore fora do StoreProvider');
  return c;
}

/* ---------- Leituras públicas (comunidade / perfil público / time compartilhado) ---------- */

export async function lerTimesPublicos(max = 12): Promise<Team[]> {
  if (!firebaseEnabled) return [];
  const { db } = await fb();
  const fs = await import('firebase/firestore');
  // Busca uma folga maior e ordena aqui: assim a Home mostra os mais recentes sem precisar de índice composto.
  const q = fs.query(fs.collectionGroup(db, 'teams'), fs.where('publico', '==', true), fs.limit(Math.max(max, 60)));
  const s = await fs.getDocs(q);
  return s.docs
    .map((d) => ({ ...(d.data() as Team), id: d.id }))
    .filter((t) => t.pokemon?.length && t.autorUid)
    .sort((a, b) => b.atualizadoEm - a.atualizadoEm)
    .slice(0, max);
}

export async function lerTimePublico(uid: string, teamId: string): Promise<Team | null> {
  if (!firebaseEnabled) return null;
  const { db } = await fb();
  const fs = await import('firebase/firestore');
  const d = await fs.getDoc(fs.doc(db, 'users', uid, 'teams', teamId));
  return d.exists() ? ({ ...(d.data() as Team), id: d.id }) : null;
}

export interface PublicProfile extends Omit<Profile, 'perfilPublico' | 'skin' | 'timePrincipal'> {
  uid: string;
  skin?: string | null;
  timePrincipal?: TimeResumo | null;
}

export async function lerPerfilPublico(nick: string): Promise<{ perfil: PublicProfile; times: Team[] } | null> {
  if (!firebaseEnabled) return null;
  const { db } = await fb();
  const fs = await import('firebase/firestore');
  const d = await fs.getDoc(fs.doc(db, 'publicProfiles', nickKey(nick)));
  if (!d.exists()) return null;
  const perfil = d.data() as PublicProfile;
  const s = await fs.getDocs(
    fs.query(fs.collection(db, 'users', perfil.uid, 'teams'), fs.where('publico', '==', true)),
  );
  return { perfil, times: s.docs.map((x) => ({ ...(x.data() as Team), id: x.id })) };
}

/** Busca perfis públicos pelo começo do nick (o id do documento é o nick em minúsculas). */
export async function buscarPerfis(prefixo: string, max = 20): Promise<PublicProfile[]> {
  if (!firebaseEnabled) return [];
  const { db } = await fb();
  const fs = await import('firebase/firestore');
  const p = prefixo.trim().toLowerCase();
  const base = fs.collection(db, 'publicProfiles');
  const q = p
    ? fs.query(base, fs.orderBy(fs.documentId()), fs.startAt(p), fs.endAt(p + ''), fs.limit(max))
    : fs.query(base, fs.limit(max));
  const s = await fs.getDocs(q);
  return s.docs.map((d) => d.data() as PublicProfile);
}

export function resumoDe(t: Team | undefined): TimeResumo | null {
  if (!t) return null;
  return { id: t.id, nome: t.nome, formato: t.formato, pokemon: t.pokemon.map((s) => ({ dex: s.dex, especie: s.especie, shiny: s.shiny })) };
}

/* ---------- skin de qualquer nick (para a foto de perfil ser a cabeça da skin) ---------- */
const skinCache = new Map<string, Promise<string | undefined>>();
/** Textura enviada por um jogador com perfil público; undefined = usar a skin do nick. */
export function skinEnviadaDe(nick: string): Promise<string | undefined> {
  const k = nick.trim().toLowerCase();
  if (!firebaseEnabled || !k) return Promise.resolve(undefined);
  if (!skinCache.has(k))
    skinCache.set(
      k,
      fb()
        .then(async ({ db }) => {
          const fs = await import('firebase/firestore');
          const d = await fs.getDoc(fs.doc(db, 'publicProfiles', k));
          return (d.exists() && (d.data().skin as string)) || undefined;
        })
        .catch(() => undefined),
    );
  return skinCache.get(k)!;
}
