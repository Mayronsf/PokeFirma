import type { Chapter } from '../config';
import { STAT_KEYS, type StatKey } from './pt';

export type Formato = 'historia' | 'singles' | 'ubers';
export const FORMATOS: { id: Formato; nome: string; desc: string }[] = [
  { id: 'historia', nome: 'História', desc: 'Respeita o Level Cap do capítulo atual.' },
  { id: 'singles', nome: 'Liga Singles', desc: 'Copas Kanto, Johto e Hoenn: 6v6, clauses da Liga.' },
  { id: 'ubers', nome: 'Copa Ubers', desc: 'Grande Final: Vale-Tudo Nv. 100, lendários liberados.' },
];

export type Stats = Record<StatKey, number>;

export interface Slot {
  uid: string;
  dex: number;
  especie: string; // slug da PokéAPI
  apelido: string;
  nivel: number;
  habilidade: string;
  item: string;
  natureza: string;
  golpes: string[]; // slugs, até 4
  tera: string;
  shiny: boolean;
  evs: Stats;
  ivs: Stats;
}

export interface Team {
  id: string;
  nome: string;
  formato: Formato;
  capitulo?: Chapter;
  pokemon: Slot[];
  publico: boolean;
  atualizadoEm: number;
  autorNick?: string;
  autorUid?: string;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const statsOf = (v: number): Stats => Object.fromEntries(STAT_KEYS.map((k) => [k, v])) as Stats;

export function novoSlot(dex: number, especie: string, defaults?: Partial<Slot>): Slot {
  return {
    uid: uid(),
    dex,
    especie,
    apelido: '',
    nivel: 50,
    habilidade: '',
    item: '',
    natureza: 'Hardy',
    golpes: [],
    tera: '',
    shiny: false,
    evs: statsOf(0),
    ivs: statsOf(31),
    ...defaults,
  };
}

export function novoTime(nome = 'Novo time', formato: Formato = 'singles'): Team {
  return { id: uid(), nome, formato, pokemon: [], publico: false, atualizadoEm: Date.now() };
}
