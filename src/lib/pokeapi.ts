/**
 * PokéAPI (pokeapi.co) — busca sob demanda + cache no navegador (IndexedDB).
 * Política de uso justo: a lista leve é montada 1x por mês (19 requisições);
 * detalhes só quando o Pokémon é aberto, e cada resposta fica guardada.
 */
import { cacheGet, cacheSet } from './idb';
import { MAX_DEX, prettyName } from './pt';

const API = 'https://pokeapi.co/api/v2';
const MONTH = 30 * 24 * 3600 * 1000;
const RAW = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

export const spriteUrl = (id: number, shiny = false) => `${RAW}/${shiny ? 'shiny/' : ''}${id}.png`;
export const artworkUrl = (id: number, shiny = false) =>
  `${RAW}/other/official-artwork/${shiny ? 'shiny/' : ''}${id}.png`;

export const LEGENDARY = new Set([
  144, 145, 146, 150, 243, 244, 245, 249, 250, 377, 378, 379, 380, 381, 382, 383, 384, 480, 481, 482, 483, 484, 485,
  486, 487, 488, 638, 639, 640, 641, 642, 643, 644, 645, 646, 716, 717, 718, 772, 773, 785, 786, 787, 788, 789, 790,
  791, 792, 800, 888, 889, 890, 891, 892, 894, 895, 896, 897, 898, 905, 1001, 1002, 1003, 1004, 1007, 1008, 1014,
  1015, 1016, 1017, 1024,
]);
export const MYTHICAL = new Set([
  151, 251, 385, 386, 489, 490, 491, 492, 493, 494, 647, 648, 649, 719, 720, 721, 801, 802, 807, 808, 809, 893, 1025,
]);

const inflight = new Map<string, Promise<unknown>>();

async function getJSON<T>(url: string): Promise<T> {
  if (inflight.has(url)) return inflight.get(url) as Promise<T>;
  const p = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`PokéAPI respondeu ${r.status}`);
      return r.json() as Promise<T>;
    })
    .finally(() => inflight.delete(url));
  inflight.set(url, p);
  return p;
}

async function cached<T>(key: string, load: () => Promise<T>, maxAge = MONTH): Promise<T> {
  const hit = await cacheGet<T>(key, maxAge);
  if (hit !== undefined) return hit;
  const v = await load();
  await cacheSet(key, v);
  return v;
}

const idFromUrl = (u: string) => Number(u.split('/').filter(Boolean).pop());

/* ---------- Lista leve ---------- */

export interface IndexEntry {
  id: number;
  slug: string;
  name: string;
  types: string[];
}

export function getIndex(): Promise<IndexEntry[]> {
  return cached('index:v2', async () => {
    const species = await getJSON<{ results: { name: string; url: string }[] }>(
      `${API}/pokemon-species?limit=${MAX_DEX}`,
    );
    const typeNames = ['normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'];
    const typeMap = new Map<number, [string, number][]>();
    const typeRes = await Promise.all(
      typeNames.map((t) =>
        getJSON<{ pokemon: { slot: number; pokemon: { url: string } }[] }>(`${API}/type/${t}`).then((r) => ({ t, r })),
      ),
    );
    for (const { t, r } of typeRes) {
      for (const p of r.pokemon) {
        const id = idFromUrl(p.pokemon.url);
        if (id > MAX_DEX) continue;
        const arr = typeMap.get(id) ?? [];
        arr.push([t, p.slot]);
        typeMap.set(id, arr);
      }
    }
    return species.results
      .map((s) => {
        const id = idFromUrl(s.url);
        const types = (typeMap.get(id) ?? []).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
        return { id, slug: s.name, name: prettyName(s.name), types };
      })
      .sort((a, b) => a.id - b.id);
  });
}

/* ---------- Detalhe ---------- */

export interface MoveLearn {
  slug: string;
  method: 'level' | 'machine' | 'egg' | 'tutor';
  level: number;
}
export interface PokemonDetail {
  id: number;
  slug: string;
  name: string;
  types: string[];
  height: number; // decímetros
  weight: number; // hectogramas
  abilities: { slug: string; hidden: boolean }[];
  stats: { key: string; base: number }[];
  moves: MoveLearn[];
  versionGroup: string;
}

const VG_ORDER = [
  'scarlet-violet', 'sword-shield', 'brilliant-diamond-shining-pearl', 'ultra-sun-ultra-moon', 'sun-moon',
  'omega-ruby-alpha-sapphire', 'x-y', 'black-2-white-2', 'black-white', 'heartgold-soulsilver', 'platinum',
  'diamond-pearl', 'emerald', 'firered-leafgreen', 'ruby-sapphire', 'crystal', 'gold-silver', 'yellow', 'red-blue',
];

interface RawPokemon {
  id: number;
  name: string;
  species: { name: string };
  height: number;
  weight: number;
  types: { slot: number; type: { name: string } }[];
  abilities: { is_hidden: boolean; ability: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  moves: {
    move: { name: string };
    version_group_details: { level_learned_at: number; move_learn_method: { name: string }; version_group: { name: string } }[];
  }[];
}

export function getPokemon(id: number): Promise<PokemonDetail> {
  return cached(`pkmn:${id}`, async () => {
    const r = await getJSON<RawPokemon>(`${API}/pokemon/${id}`);
    const groups = new Set(r.moves.flatMap((m) => m.version_group_details.map((d) => d.version_group.name)));
    const vg = VG_ORDER.find((g) => groups.has(g)) ?? [...groups][0] ?? '';
    const moves: MoveLearn[] = [];
    for (const m of r.moves) {
      for (const d of m.version_group_details) {
        if (d.version_group.name !== vg) continue;
        const method = d.move_learn_method.name;
        if (method === 'level-up') moves.push({ slug: m.move.name, method: 'level', level: d.level_learned_at });
        else if (method === 'machine') moves.push({ slug: m.move.name, method: 'machine', level: 0 });
        else if (method === 'egg') moves.push({ slug: m.move.name, method: 'egg', level: 0 });
        else if (method === 'tutor') moves.push({ slug: m.move.name, method: 'tutor', level: 0 });
      }
    }
    moves.sort((a, b) => a.level - b.level || a.slug.localeCompare(b.slug));
    return {
      id: r.id,
      slug: r.species.name,
      name: prettyName(r.species.name),
      types: r.types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name),
      height: r.height,
      weight: r.weight,
      abilities: r.abilities.map((a) => ({ slug: a.ability.name, hidden: a.is_hidden })),
      stats: r.stats.map((s) => ({ key: s.stat.name, base: s.base_stat })),
      moves,
      versionGroup: vg,
    };
  });
}

export interface SpeciesDetail {
  flavor: string;
  flavorVersion: string;
  genus: string;
  evoChainUrl: string | null;
  legendary: boolean;
  mythical: boolean;
  /** Formas Mega (e Primal) da espécie, vindas de pokemon-species.varieties. */
  megas: MegaForm[];
}

export interface MegaForm {
  id: number;
  slug: string;
  nome: string;
  primal: boolean;
}

function megaNome(slug: string): string {
  const m = slug.match(/^(.*)-(mega|primal)(?:-(x|y|z))?$/);
  if (!m) return prettyName(slug);
  const base = prettyName(m[1]);
  if (m[2] === 'primal') return `Primal ${base}`;
  return `Mega ${base}${m[3] ? ' ' + m[3].toUpperCase() : ''}`;
}

export function getSpecies(id: number): Promise<SpeciesDetail> {
  return cached(`species2:${id}`, async () => {
    const r = await getJSON<{
      flavor_text_entries: { flavor_text: string; language: { name: string }; version: { name: string } }[];
      genera: { genus: string; language: { name: string } }[];
      evolution_chain: { url: string } | null;
      is_legendary: boolean;
      is_mythical: boolean;
      varieties: { is_default: boolean; pokemon: { name: string; url: string } }[];
    }>(`${API}/pokemon-species/${id}`);
    const en = r.flavor_text_entries.filter((f) => f.language.name === 'en');
    const last = en[en.length - 1];
    return {
      flavor: last ? last.flavor_text.replace(/[\f\n\r­]+/g, ' ').replace(/\s+/g, ' ').trim() : '',
      flavorVersion: last ? prettyName(last.version.name) : '',
      genus: r.genera.find((g) => g.language.name === 'en')?.genus ?? '',
      evoChainUrl: r.evolution_chain?.url ?? null,
      legendary: r.is_legendary,
      mythical: r.is_mythical,
      megas: r.varieties
        .filter((v) => !v.is_default && /-(mega|primal)(-[xyz])?$/.test(v.pokemon.name))
        .map((v) => ({ id: idFromUrl(v.pokemon.url), slug: v.pokemon.name, nome: megaNome(v.pokemon.name), primal: v.pokemon.name.includes('-primal') })),
    };
  });
}

export interface EvoNode {
  id: number;
  name: string;
  how: string;
  children: EvoNode[];
}

interface RawEvo {
  species: { name: string; url: string };
  evolution_details: {
    min_level: number | null;
    trigger: { name: string };
    item: { name: string } | null;
    held_item: { name: string } | null;
    min_happiness: number | null;
    time_of_day: string;
    known_move: { name: string } | null;
    location: { name: string } | null;
  }[];
  evolves_to: RawEvo[];
}

function howText(d: RawEvo['evolution_details'][number] | undefined): string {
  if (!d) return '';
  const parts: string[] = [];
  if (d.trigger.name === 'level-up') {
    if (d.min_level) parts.push(`Nv. ${d.min_level}`);
    else parts.push('Subir de nível');
  }
  if (d.trigger.name === 'trade') parts.push('Troca');
  if (d.trigger.name === 'use-item' && d.item) parts.push(prettyName(d.item.name));
  if (d.held_item) parts.push(`segurando ${prettyName(d.held_item.name)}`);
  if (d.min_happiness) parts.push('amizade alta');
  if (d.time_of_day === 'day') parts.push('de dia');
  if (d.time_of_day === 'night') parts.push('à noite');
  if (d.known_move) parts.push(`sabendo ${prettyName(d.known_move.name)}`);
  if (d.location) parts.push(`em ${prettyName(d.location.name)}`);
  if (!parts.length) parts.push(prettyName(d.trigger.name));
  return parts.join(' · ');
}

export function getEvolution(url: string): Promise<EvoNode> {
  return cached(`evo:${url}`, async () => {
    const r = await getJSON<{ chain: RawEvo }>(url);
    const walk = (n: RawEvo): EvoNode => ({
      id: idFromUrl(n.species.url),
      name: prettyName(n.species.name),
      how: howText(n.evolution_details[0]),
      children: n.evolves_to.map(walk),
    });
    return walk(r.chain);
  });
}

export interface MoveDetail {
  slug: string;
  type: string;
  damageClass: 'physical' | 'special' | 'status';
  power: number | null;
  accuracy: number | null;
  pp: number | null;
}

export function getMove(slug: string): Promise<MoveDetail> {
  return cached(`move:${slug}`, async () => {
    const r = await getJSON<{
      name: string;
      type: { name: string };
      damage_class: { name: 'physical' | 'special' | 'status' };
      power: number | null;
      accuracy: number | null;
      pp: number | null;
    }>(`${API}/move/${slug}`);
    return { slug: r.name, type: r.type.name, damageClass: r.damage_class.name, power: r.power, accuracy: r.accuracy, pp: r.pp };
  });
}

export function getHoldableItems(): Promise<string[]> {
  return cached('items:holdable', async () => {
    const [a, b] = await Promise.all([
      getJSON<{ items: { name: string }[] }>(`${API}/item-attribute/holdable-active`),
      getJSON<{ items: { name: string }[] }>(`${API}/item-attribute/holdable-passive`).catch(() => ({ items: [] })),
    ]);
    const names = new Set([...a.items, ...b.items].map((i) => prettyName(i.name)));
    return [...names].sort((x, y) => x.localeCompare(y));
  });
}

/* ---------- tradução automática da descrição da Pokédex (PokéAPI não tem pt-BR) ---------- */
async function viaGoogle(texto: string): Promise<string> {
  const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=pt&dt=t&q=${encodeURIComponent(texto)}`);
  if (!r.ok) throw new Error(String(r.status));
  const j = (await r.json()) as [[string, string][]];
  const out = j[0].map((p) => p[0]).join('').trim();
  if (!out) throw new Error('vazio');
  return out;
}
async function viaMyMemory(texto: string): Promise<string> {
  const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=en|pt-BR`);
  const j = (await r.json()) as { responseStatus: number; responseData: { translatedText: string } };
  if (j.responseStatus !== 200 || !j.responseData.translatedText) throw new Error('mymemory');
  return j.responseData.translatedText.trim();
}
/** Traduz um texto curto do inglês para português (com cache no IndexedDB). Rejeita se nenhum serviço responder. */
export function traduzirPt(texto: string): Promise<string> {
  const t = texto.trim();
  if (!t) return Promise.resolve('');
  return cached(`pt1:${t}`, () => viaGoogle(t).catch(() => viaMyMemory(t)), 12 * MONTH);
}
