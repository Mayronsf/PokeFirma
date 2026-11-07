/** Validação de times por formato — regras de REGRAS_LIGA_POKEMON.md + src/config.ts. */
import { config, type Chapter } from '../config';
import { golpesEvasao, golpesOHKO, golpesSono } from '../content/regras';
import { LEGENDARY, MYTHICAL } from './pokeapi';
import { prettyName } from './pt';
import type { Team } from './team';

export type Nivel = 'erro' | 'aviso' | 'info';
export interface Aviso {
  nivel: Nivel;
  texto: string;
  slot?: string;
}

export function validarTime(team: Team, capituloAtual: Chapter): Aviso[] {
  const out: Aviso[] = [];
  const p = team.pokemon;
  const nome = (s: (typeof p)[number]) => s.apelido || prettyName(s.especie);

  if (p.length > 6) out.push({ nivel: 'erro', texto: 'Um time tem no máximo 6 Pokémon.' });

  // EVs: 510 total, 252 por stat
  for (const s of p) {
    const total = Object.values(s.evs).reduce((a, b) => a + b, 0);
    if (total > 510) out.push({ nivel: 'erro', slot: s.uid, texto: `${nome(s)} tem ${total} EVs (máximo 510).` });
    if (Object.values(s.evs).some((v) => v > 252))
      out.push({ nivel: 'erro', slot: s.uid, texto: `${nome(s)}: cada stat aceita no máximo 252 EVs.` });
  }

  if (team.formato === 'historia') {
    const cap = config.levelCaps[team.capitulo ?? capituloAtual];
    if (cap == null) {
      out.push({ nivel: 'info', texto: `Level Cap do capítulo ${team.capitulo ?? capituloAtual} ainda não definido [A DEFINIR].` });
    } else {
      for (const s of p) {
        if (s.nivel > cap + config.folgaLevelCap.max)
          out.push({ nivel: 'erro', slot: s.uid, texto: `${nome(s)} (Nv. ${s.nivel}) passa do Level Cap ${cap} mesmo com a folga de +${config.folgaLevelCap.max}.` });
        else if (s.nivel > cap)
          out.push({ nivel: 'aviso', slot: s.uid, texto: `${nome(s)} (Nv. ${s.nivel}) está acima do Level Cap ${cap}, dentro da folga de +${config.folgaLevelCap.min} a +${config.folgaLevelCap.max}.` });
      }
    }
    return out;
  }

  // Species Clause
  const seen = new Map<number, string>();
  for (const s of p) {
    if (seen.has(s.dex))
      out.push({ nivel: 'erro', slot: s.uid, texto: `Species Clause: ${prettyName(s.especie)} aparece duas vezes.` });
    seen.set(s.dex, s.uid);
  }

  // Evasion & OHKO Clause
  for (const s of p) {
    for (const g of s.golpes) {
      if (golpesEvasao.includes(g))
        out.push({ nivel: 'erro', slot: s.uid, texto: `Evasion Clause: ${prettyName(g)} é proibido (${nome(s)}).` });
      if (golpesOHKO.includes(g))
        out.push({ nivel: 'erro', slot: s.uid, texto: `OHKO Clause: ${prettyName(g)} é proibido (${nome(s)}).` });
    }
  }

  // Sleep Clause (regra de batalha — só lembrete)
  const sono = p.filter((s) => s.golpes.some((g) => golpesSono.includes(g)));
  if (sono.length)
    out.push({ nivel: 'info', texto: `Sleep Clause: ${sono.map(nome).join(', ')} pode${sono.length > 1 ? 'm' : ''} fazer dormir. Só 1 adversário dormindo por vez.` });

  // Banidos configurados
  const banidos = config.banidos[team.formato as 'singles' | 'ubers'] ?? [];
  for (const s of p) {
    if (banidos.includes(s.especie))
      out.push({ nivel: 'erro', slot: s.uid, texto: `${prettyName(s.especie)} é banido no formato ${team.formato === 'singles' ? 'Liga Singles' : 'Copa Ubers'}.` });
  }

  // Nível máximo
  const max = config.nivelMaximo[team.formato as 'singles' | 'ubers'];
  if (max != null) {
    for (const s of p)
      if (s.nivel > max) out.push({ nivel: 'erro', slot: s.uid, texto: `${nome(s)} passa do nível máximo ${max}.` });
  } else if (team.formato === 'singles') {
    out.push({ nivel: 'info', texto: 'Nível máximo da Liga Singles ainda não definido no regulamento [A DEFINIR].' });
  }

  if (team.formato === 'singles') {
    // Formas restritas à Copa Ubers
    const restritos: Record<string, string> = {
      'red-orb': 'Primal Groudon', 'blue-orb': 'Primal Kyogre', 'mewtwonite-x': 'Mega Mewtwo X', 'mewtwonite-y': 'Mega Mewtwo Y',
    };
    for (const s of p) {
      const it = s.item.toLowerCase().replace(/\s+/g, '-');
      if (restritos[it])
        out.push({ nivel: 'erro', slot: s.uid, texto: `${restritos[it]} só é liberado na Copa Ubers (${nome(s)} segura ${s.item}).` });
      if (s.especie === 'rayquaza' && s.golpes.includes('dragon-ascent'))
        out.push({ nivel: 'aviso', slot: s.uid, texto: 'Mega Rayquaza só é liberado na Copa Ubers: não Mega Evolua este Rayquaza.' });
    }
    // Lendários: o regulamento libera na chave especial da Copa Ubers
    const lend = p.filter((s) => LEGENDARY.has(s.dex) || MYTHICAL.has(s.dex));
    if (lend.length)
      out.push({ nivel: 'aviso', texto: `${lend.map(nome).join(', ')}: lendários são liberados na chave especial da Copa Ubers. Confirme com a organização se valem na Liga Singles.` });
    out.push({ nivel: 'info', texto: 'Na batalha: no máximo 1 Mega Evolução e/ou 1 Terastal/Z-Move. Itens de cura da mochila são proibidos.' });
  }

  return out;
}
