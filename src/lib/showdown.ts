/** Importar/exportar no formato de texto do Pokémon Showdown. */
import type { IndexEntry } from './pokeapi';
import { STAT_KEYS, statKeyShowdown, prettyName, toSlug, type StatKey } from './pt';
import { novoSlot, statsOf, type Slot } from './team';

const sdName = (slug: string) => prettyName(slug);

export function exportTeam(slots: Slot[]): string {
  return slots
    .map((s) => {
      const lines: string[] = [];
      const species = sdName(s.especie);
      let head = s.apelido ? `${s.apelido} (${species})` : species;
      if (s.item) head += ` @ ${s.item}`;
      lines.push(head);
      if (s.habilidade) lines.push(`Ability: ${sdName(s.habilidade)}`);
      if (s.nivel !== 100) lines.push(`Level: ${s.nivel}`);
      if (s.shiny) lines.push('Shiny: Yes');
      if (s.tera) lines.push(`Tera Type: ${s.tera[0].toUpperCase()}${s.tera.slice(1)}`);
      const evs = STAT_KEYS.filter((k) => s.evs[k] > 0).map((k) => `${s.evs[k]} ${statKeyShowdown[k]}`);
      if (evs.length) lines.push(`EVs: ${evs.join(' / ')}`);
      if (s.natureza) lines.push(`${s.natureza} Nature`);
      const ivs = STAT_KEYS.filter((k) => s.ivs[k] !== 31).map((k) => `${s.ivs[k]} ${statKeyShowdown[k]}`);
      if (ivs.length) lines.push(`IVs: ${ivs.join(' / ')}`);
      for (const g of s.golpes) lines.push(`- ${sdName(g)}`);
      return lines.join('\n');
    })
    .join('\n\n');
}

function parseStats(line: string, base: number): Record<StatKey, number> {
  const out = statsOf(base);
  for (const part of line.split('/')) {
    const m = part.trim().match(/^(\d+)\s+(\w+)$/);
    if (!m) continue;
    const key = (Object.keys(statKeyShowdown) as StatKey[]).find(
      (k) => statKeyShowdown[k].toLowerCase() === m[2].toLowerCase(),
    );
    if (key) out[key] = Number(m[1]);
  }
  return out;
}

export interface ImportResult {
  slots: Slot[];
  erros: string[];
}

export function importTeam(text: string, index: IndexEntry[]): ImportResult {
  const bySlug = new Map(index.map((e) => [e.slug, e]));
  const erros: string[] = [];
  const slots: Slot[] = [];
  const blocks = text
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim());
    let head = lines[0];
    let item = '';
    const at = head.lastIndexOf(' @ ');
    if (at >= 0) {
      item = head.slice(at + 3).trim();
      head = head.slice(0, at).trim();
    }
    head = head.replace(/\s*\((M|F)\)\s*$/, '');
    let apelido = '';
    let species = head;
    const paren = head.match(/^(.*)\(([^()]+)\)\s*$/);
    if (paren) {
      apelido = paren[1].trim();
      species = paren[2].trim();
    }
    let slug = toSlug(species);
    let entry = bySlug.get(slug);
    if (!entry) {
      // formas ("Deoxys-Speed", "Rotom-Wash") caem na espécie base
      const base = slug.split('-')[0];
      entry = bySlug.get(base);
      if (entry) erros.push(`${species}: formas alternativas não são suportadas, usei ${entry.name}.`);
    }
    if (!entry) {
      erros.push(`Não reconheci o Pokémon “${species}”.`);
      continue;
    }
    slug = entry.slug;
    const slot = novoSlot(entry.id, slug, { apelido, item, nivel: 100 });
    for (const l of lines.slice(1)) {
      if (l.startsWith('Ability:')) slot.habilidade = toSlug(l.slice(8));
      else if (l.startsWith('Level:')) slot.nivel = Math.max(1, Math.min(100, Number(l.slice(6)) || 100));
      else if (l.startsWith('Shiny:')) slot.shiny = /yes/i.test(l);
      else if (l.startsWith('Tera Type:')) slot.tera = l.slice(10).trim().toLowerCase();
      else if (l.startsWith('EVs:')) slot.evs = parseStats(l.slice(4), 0);
      else if (l.startsWith('IVs:')) slot.ivs = parseStats(l.slice(4), 31);
      else if (/Nature$/.test(l)) slot.natureza = l.replace(/\s*Nature$/, '').trim();
      else if (l.startsWith('-') && slot.golpes.length < 4) slot.golpes.push(toSlug(l.slice(1).split('/')[0]));
    }
    slots.push(slot);
    if (slots.length === 6) {
      if (blocks.length > 6) erros.push('O texto tinha mais de 6 Pokémon; importei só os 6 primeiros.');
      break;
    }
  }
  return { slots, erros };
}
