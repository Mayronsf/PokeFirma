/**
 * Dados que vêm do servidor Minecraft (Cobblemon) — compartilhado entre o site e as funções /api.
 * Sem imports: este arquivo roda no navegador e no Node.
 *
 * Firestore:
 *   treinadores/{uuid}   time (party), PC, Pokédex, insígnias — escrito só pelo servidor (Admin SDK).
 *   vinculos/{uuid}      { uid, nick, trainer_id } — qual conta do site é dona daquele jogador.
 *   link_tokens/{token}  token do /vincular, de uso único e com validade.
 *   liga/meta            { proximoTrainer } — contador do Trainer ID (TR-001, TR-002…).
 */

export type Sexo = 'M' | 'F' | null;
export interface Stats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}
export interface MonJogo {
  dex: number;
  especie: string;
  forma: string | null;
  apelido: string | null;
  nivel: number;
  shiny: boolean;
  sexo: Sexo;
  habilidade: string | null;
  natureza: string | null;
  item: string | null;
  golpes: string[];
  ivs: Stats | null;
  evs: Stats | null;
  tera: string | null;
  bola: string | null;
  amizade: number | null;
  /** Só no PC: caixa (1…) e posição dentro dela. */
  caixa: number | null;
  slot: number | null;
}
export interface PokedexJogo {
  vistos: number[];
  capturados: number[];
  total_vistos: number;
  total_capturados: number;
}
export interface Treinador {
  uuid: string;
  nick: string;
  uid: string | null;
  trainer_id: string | null;
  /** Mostra time/PC/Pokédex para todos? (segue o "perfil público" do site). */
  publico: boolean;
  capitulo: number | null;
  level_cap: number | null;
  insignias: string[];
  party: MonJogo[];
  pc: MonJogo[];
  pokedex: PokedexJogo | null;
  atualizadoEm: number;
}

/* ---------- insígnias aceitas (mesmos IDs do BadgeCase) ---------- */
const REGIOES = ['kanto', 'johto', 'hoenn', 'sinnoh'];
export const INSIGNIAS_VALIDAS = new Set(REGIOES.flatMap((r) => [...Array.from({ length: 8 }, (_, i) => `${r}-${i + 1}`), `${r}-elite`, `${r}-campeao`]));

/* ---------- limpeza do que chega do servidor ---------- */
const str = (v: unknown, max = 40): string | null => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);
const num = (v: unknown, min: number, max: number): number | null => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.round(n))) : null;
};
const stats = (v: unknown, max: number): Stats | null => {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const pick = (...ks: string[]) => {
    for (const k of ks) {
      const n = num(o[k], 0, max);
      if (n !== null) return n;
    }
    return 0;
  };
  return {
    hp: pick('hp', 'HP'),
    atk: pick('atk', 'attack', 'ATK'),
    def: pick('def', 'defence', 'defense', 'DEF'),
    spa: pick('spa', 'special_attack', 'sp_atk', 'SPA'),
    spd: pick('spd', 'special_defence', 'special_defense', 'sp_def', 'SPD'),
    spe: pick('spe', 'speed', 'SPE'),
  };
};
const sexo = (v: unknown): Sexo => {
  const s = String(v ?? '').trim().toLowerCase();
  if (['m', 'male', 'macho', '♂'].includes(s)) return 'M';
  if (['f', 'female', 'femea', 'fêmea', '♀'].includes(s)) return 'F';
  return null;
};
const slug = (v: unknown) =>
  (str(v, 40) ?? '')
    .toLowerCase()
    .replace(/^cobblemon:/, '')
    .replace(/[\s_]+/g, '-');

export function limparMon(raw: unknown): MonJogo | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const dex = num(o.dex ?? o.national_dex ?? o.pokedex, 1, 2000);
  const especie = slug(o.especie ?? o.species);
  if (!dex || !especie) return null;
  const golpes = (Array.isArray(o.golpes ?? o.moves) ? ((o.golpes ?? o.moves) as unknown[]) : [])
    .map((g) => slug(g))
    .filter(Boolean)
    .slice(0, 4);
  return {
    dex,
    especie,
    forma: str(o.forma ?? o.form, 30),
    apelido: str(o.apelido ?? o.nickname, 24),
    nivel: num(o.nivel ?? o.level, 1, 100) ?? 1,
    shiny: o.shiny === true || o.shiny === 'true',
    sexo: sexo(o.sexo ?? o.gender),
    habilidade: str(o.habilidade ?? o.ability, 40),
    natureza: str(o.natureza ?? o.nature, 20),
    item: str(o.item ?? o.held_item, 40),
    golpes,
    ivs: stats(o.ivs, 31),
    evs: stats(o.evs, 252),
    tera: str(o.tera ?? o.tera_type, 20),
    bola: str(o.bola ?? o.ball ?? o.pokeball, 40),
    amizade: num(o.amizade ?? o.friendship, 0, 255),
    caixa: num(o.caixa ?? o.box, 0, 999),
    slot: num(o.slot, 0, 999),
  };
}

export function limparPokedex(raw: unknown): PokedexJogo | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const lista = (v: unknown) => [...new Set((Array.isArray(v) ? v : []).map((x) => num(x, 1, 2000)).filter((x): x is number => x !== null))].sort((a, b) => a - b);
  const vistos = lista(o.vistos ?? o.seen);
  const capturados = lista(o.capturados ?? o.caught);
  return {
    vistos,
    capturados,
    total_vistos: num(o.total_vistos, 0, 5000) ?? vistos.length,
    total_capturados: num(o.total_capturados, 0, 5000) ?? capturados.length,
  };
}

export const limparInsignias = (v: unknown): string[] =>
  [...new Set((Array.isArray(v) ? v : []).map((x) => String(x).trim().toLowerCase()).filter((x) => INSIGNIAS_VALIDAS.has(x)))];

export const formatarTrainerId = (n: number) => `TR-${String(n).padStart(3, '0')}`;
