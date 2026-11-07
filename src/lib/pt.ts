/** Traduções locais (a PokéAPI não tem pt-BR para a maior parte dos dados). */

export const TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
] as const;
export type TypeName = (typeof TYPES)[number];

export const typePt: Record<string, string> = {
  normal: 'Normal', fire: 'Fogo', water: 'Água', electric: 'Elétrico', grass: 'Planta', ice: 'Gelo',
  fighting: 'Lutador', poison: 'Venenoso', ground: 'Terrestre', flying: 'Voador', psychic: 'Psíquico',
  bug: 'Inseto', rock: 'Pedra', ghost: 'Fantasma', dragon: 'Dragão', dark: 'Sombrio', steel: 'Aço',
  fairy: 'Fada', stellar: 'Estelar',
};

export const statPt: Record<string, { curto: string; longo: string }> = {
  hp: { curto: 'PS', longo: 'Pontos de Saúde' },
  attack: { curto: 'Atq', longo: 'Ataque' },
  defense: { curto: 'Def', longo: 'Defesa' },
  'special-attack': { curto: 'At.Esp', longo: 'Ataque Especial' },
  'special-defense': { curto: 'Df.Esp', longo: 'Defesa Especial' },
  speed: { curto: 'Vel', longo: 'Velocidade' },
};

export const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as const;
export type StatKey = (typeof STAT_KEYS)[number];
export const statKeyPt: Record<StatKey, string> = { hp: 'PS', atk: 'Atq', def: 'Def', spa: 'At.Esp', spd: 'Df.Esp', spe: 'Vel' };
export const statKeyShowdown: Record<StatKey, string> = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' };

export interface Nature {
  en: string;
  pt: string;
  up?: StatKey;
  down?: StatKey;
}
export const NATURES: Nature[] = [
  { en: 'Hardy', pt: 'Firme' },
  { en: 'Lonely', pt: 'Solitária', up: 'atk', down: 'def' },
  { en: 'Brave', pt: 'Corajosa', up: 'atk', down: 'spe' },
  { en: 'Adamant', pt: 'Rígida', up: 'atk', down: 'spa' },
  { en: 'Naughty', pt: 'Travessa', up: 'atk', down: 'spd' },
  { en: 'Bold', pt: 'Ousada', up: 'def', down: 'atk' },
  { en: 'Docile', pt: 'Dócil' },
  { en: 'Relaxed', pt: 'Relaxada', up: 'def', down: 'spe' },
  { en: 'Impish', pt: 'Marota', up: 'def', down: 'spa' },
  { en: 'Lax', pt: 'Displicente', up: 'def', down: 'spd' },
  { en: 'Timid', pt: 'Tímida', up: 'spe', down: 'atk' },
  { en: 'Hasty', pt: 'Apressada', up: 'spe', down: 'def' },
  { en: 'Serious', pt: 'Séria' },
  { en: 'Jolly', pt: 'Alegre', up: 'spe', down: 'spa' },
  { en: 'Naive', pt: 'Ingênua', up: 'spe', down: 'spd' },
  { en: 'Modest', pt: 'Modesta', up: 'spa', down: 'atk' },
  { en: 'Mild', pt: 'Amena', up: 'spa', down: 'def' },
  { en: 'Quiet', pt: 'Quieta', up: 'spa', down: 'spe' },
  { en: 'Bashful', pt: 'Acanhada' },
  { en: 'Rash', pt: 'Precipitada', up: 'spa', down: 'spd' },
  { en: 'Calm', pt: 'Calma', up: 'spd', down: 'atk' },
  { en: 'Gentle', pt: 'Gentil', up: 'spd', down: 'def' },
  { en: 'Sassy', pt: 'Atrevida', up: 'spd', down: 'spe' },
  { en: 'Careful', pt: 'Cuidadosa', up: 'spd', down: 'spa' },
  { en: 'Quirky', pt: 'Peculiar' },
];

export const GENS = [
  { gen: 1, regiao: 'Kanto', de: 1, ate: 151 },
  { gen: 2, regiao: 'Johto', de: 152, ate: 251 },
  { gen: 3, regiao: 'Hoenn', de: 252, ate: 386 },
  { gen: 4, regiao: 'Sinnoh', de: 387, ate: 493 },
  { gen: 5, regiao: 'Unova', de: 494, ate: 649 },
  { gen: 6, regiao: 'Kalos', de: 650, ate: 721 },
  { gen: 7, regiao: 'Alola', de: 722, ate: 809 },
  { gen: 8, regiao: 'Galar', de: 810, ate: 905 },
  { gen: 9, regiao: 'Paldea', de: 906, ate: 1025 },
];
export const MAX_DEX = 1025;
export const genOf = (id: number) => GENS.find((g) => id >= g.de && id <= g.ate)?.gen ?? 0;

/** "mr-mime" → "Mr Mime"; "ho-oh" → "Ho-Oh" */
export function prettyName(slug: string): string {
  const special: Record<string, string> = {
    'ho-oh': 'Ho-Oh', 'porygon-z': 'Porygon-Z', 'mr-mime': 'Mr. Mime', 'mime-jr': 'Mime Jr.',
    'mr-rime': 'Mr. Rime', 'type-null': 'Type: Null', 'farfetchd': 'Farfetch’d', 'sirfetchd': 'Sirfetch’d',
    'nidoran-f': 'Nidoran-F', 'nidoran-m': 'Nidoran-M', 'jangmo-o': 'Jangmo-o', 'hakamo-o': 'Hakamo-o',
    'kommo-o': 'Kommo-o', 'flabebe': 'Flabébé', 'tapu-koko': 'Tapu Koko', 'tapu-lele': 'Tapu Lele',
    'tapu-bulu': 'Tapu Bulu', 'tapu-fini': 'Tapu Fini', 'wo-chien': 'Wo-Chien', 'chien-pao': 'Chien-Pao',
    'ting-lu': 'Ting-Lu', 'chi-yu': 'Chi-Yu',
  };
  if (special[slug]) return special[slug];
  return slug
    .split('-')
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(' ');
}

/** Converte qualquer nome ("Mr. Mime", "Farfetch’d") para o slug da PokéAPI. */
export function toSlug(name: string): string {
  const n = name.trim().toLowerCase();
  if (n === 'nidoran♀' || n === 'nidoran-f') return 'nidoran-f';
  if (n === 'nidoran♂' || n === 'nidoran-m') return 'nidoran-m';
  return n
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'.:]/g, '')
    .replace(/\s+/g, '-');
}

/** Formata data ISO (aaaa-mm-dd) ou timestamp como dd/mm/aaaa. */
export function fmtData(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === '') return '';
  const d = typeof v === 'number' ? new Date(v) : new Date(v.length === 10 ? v + 'T12:00:00' : v);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const dexNum = (id: number) => '#' + String(id).padStart(4, '0');
