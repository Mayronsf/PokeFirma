/**
 * Aplica o resultado de UMA batalha vinda do servidor Minecraft ao documento liga/dados.
 * Função pura (sem Firebase): usada pela rota /api/minecraft/tournament/match-result e testável à parte.
 *
 * Regras:
 * - Acha o torneio pelo id e os dois jogadores pelo UUID (inscritos → ranking).
 * - Usa a primeira partida AINDA ABERTA (sem placar) entre os dois, na ordem das fases.
 * - Cada chamada é uma batalha. O confronto fecha quando alguém vence a maioria (MD1 = 1, MD3 = 2).
 *   MD padrão: fase de grupos = torneio.mdGrupos (1), mata-mata = torneio.mdMata (3).
 * - Ao fechar: preenche pa/pb/placar, soma KOs, guarda os times da última batalha, e no ranking
 *   dá +3 pontos e +1 vitória ao vencedor e +1 derrota ao perdedor. Se for a Final, define o campeão.
 * - battle_id repetido é ignorado (o servidor pode reenviar).
 */
import type { JogoPartida, LigaData, Partida, Torneio } from './ligaTipos';

export interface ResultadoBatalha {
  torneio_id: string;
  winner_uuid: string;
  loser_uuid: string;
  ko_winner: number;
  ko_loser: number;
  team_winner_dex: number[];
  team_loser_dex: number[];
  battle_id?: string | null;
}

export interface Aplicado {
  liga: LigaData;
  duplicado: boolean;
  terminou: boolean;
  partida: Partida;
  vencedor: string;
  perdedor: string;
  placarParcial: [number, number];
}

const ORDEM_FASES = ['Grupos', 'Oitavas', 'Quartas', 'Semifinal', 'Disputa de 3º', 'Final'];
const mesmo = (a?: string | null, b?: string | null) => !!a && !!b && a.toLowerCase() === b.toLowerCase();

export class ErroResultado extends Error {
  constructor(
    public status: number,
    msg: string,
  ) {
    super(msg);
  }
}

function nickDoUuid(liga: LigaData, t: Torneio, uuid: string): { nick: string; trainer_id: string | null } {
  const i = t.inscritos?.find((x) => mesmo(x.uuid, uuid));
  if (i) return { nick: i.nick, trainer_id: i.trainer_id ?? null };
  const j = liga.jogadores.find((x) => mesmo(x.uuid, uuid));
  if (j) return { nick: j.nick, trainer_id: j.trainer_id ?? null };
  throw new ErroResultado(404, `Jogador ${uuid} não está inscrito no torneio "${t.nome}" nem no ranking.`);
}

export function mdDa(t: Torneio, p: Partida): number {
  const md = p.md ?? (p.fase === 'Grupos' ? t.mdGrupos ?? 1 : t.mdMata ?? 3);
  return md === 3 ? 3 : md === 5 ? 5 : 1;
}

export function aplicarResultado(base: LigaData, r: ResultadoBatalha, agora = Date.now()): Aplicado {
  const liga: LigaData = structuredClone(base);
  const t = liga.torneios.find((x) => x.id === r.torneio_id);
  if (!t) throw new ErroResultado(404, `Torneio "${r.torneio_id}" não encontrado.`);
  if (mesmo(r.winner_uuid, r.loser_uuid)) throw new ErroResultado(400, 'Vencedor e perdedor são o mesmo jogador.');
  const W = nickDoUuid(liga, t, r.winner_uuid);
  const L = nickDoUuid(liga, t, r.loser_uuid);

  const candidatas = t.chave
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => !p.placar && ((mesmo(p.a, W.nick) && mesmo(p.b, L.nick)) || (mesmo(p.a, L.nick) && mesmo(p.b, W.nick))))
    .sort((x, y) => {
      const fx = ORDEM_FASES.indexOf(x.p.fase);
      const fy = ORDEM_FASES.indexOf(y.p.fase);
      return (fx < 0 ? 99 : fx) - (fy < 0 ? 99 : fy) || x.i - y.i;
    });
  if (!candidatas.length) throw new ErroResultado(409, `Nenhuma partida aberta entre ${W.nick} e ${L.nick} em "${t.nome}".`);
  const { p, i } = candidatas[0];

  const jogosAntes = p.jogos ?? [];
  if (r.battle_id && jogosAntes.some((j) => j.id === r.battle_id)) {
    const wa = jogosAntes.filter((j) => j.vencedor === 'a').length;
    return { liga: base, duplicado: true, terminou: false, partida: p, vencedor: W.nick, perdedor: L.nick, placarParcial: [wa, jogosAntes.length - wa] };
  }

  const ladoW: 'a' | 'b' = mesmo(p.a, W.nick) ? 'a' : 'b';
  const jogo: JogoPartida = {
    id: r.battle_id ?? null,
    vencedor: ladoW,
    koA: ladoW === 'a' ? r.ko_winner : r.ko_loser,
    koB: ladoW === 'a' ? r.ko_loser : r.ko_winner,
    timeA: ladoW === 'a' ? r.team_winner_dex : r.team_loser_dex,
    timeB: ladoW === 'a' ? r.team_loser_dex : r.team_winner_dex,
    em: agora,
  };
  const jogos = [...jogosAntes, jogo];
  const winsA = jogos.filter((j) => j.vencedor === 'a').length;
  const winsB = jogos.length - winsA;
  const precisa = Math.floor(mdDa(t, p) / 2) + 1;
  const terminou = winsA >= precisa || winsB >= precisa;

  const nova: Partida = {
    ...p,
    jogos,
    koA: jogos.reduce((s, j) => s + j.koA, 0),
    koB: jogos.reduce((s, j) => s + j.koB, 0),
    timeA: jogo.timeA.length ? jogo.timeA : p.timeA,
    timeB: jogo.timeB.length ? jogo.timeB : p.timeB,
    pa: terminou ? winsA : null,
    pb: terminou ? winsB : null,
    placar: terminou ? `${winsA}–${winsB}` : null,
  };
  t.chave[i] = nova;

  if (terminou) {
    const vencNick = winsA > winsB ? p.a! : p.b!;
    const perdNick = winsA > winsB ? p.b! : p.a!;
    const garantir = (nick: string, uuid: string, trainer_id: string | null) => {
      let j = liga.jogadores.find((x) => mesmo(x.nick, nick));
      if (!j) {
        j = { nick, pontos: 0, vitorias: 0, derrotas: 0, titulos: [], uuid, trainer_id };
        liga.jogadores.push(j);
      }
      return j;
    };
    const venc = mesmo(vencNick, W.nick) ? garantir(W.nick, r.winner_uuid, W.trainer_id) : garantir(L.nick, r.loser_uuid, L.trainer_id);
    const perd = mesmo(perdNick, W.nick) ? garantir(W.nick, r.winner_uuid, W.trainer_id) : garantir(L.nick, r.loser_uuid, L.trainer_id);
    venc.pontos += 3;
    venc.vitorias += 1;
    perd.derrotas += 1;
    if (p.fase === 'Final') {
      t.campeao = venc.nick;
      if (!venc.titulos.includes(t.id)) venc.titulos.push(t.id);
    }
  }

  liga.rev = (base.rev ?? 0) + 1;
  liga.atualizadoEm = new Date(agora).toISOString().slice(0, 10);
  return { liga, duplicado: false, terminou, partida: nova, vencedor: W.nick, perdedor: L.nick, placarParcial: [winsA, winsB] };
}
