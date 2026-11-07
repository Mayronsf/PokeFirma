/**
 * Aplica o resultado de UMA batalha vinda do servidor Minecraft ao documento liga/dados.
 * Função pura (sem Firebase): usada pela rota /api/minecraft/tournament/match-result e testável à parte.
 *
 * Regras:
 * - Acha o torneio pelo id e os dois jogadores pelo UUID (inscritos → ranking). Sem torneio_id (o
 *   web_sync_bridge.js do servidor não sabe de qual torneio é a batalha), procura a partida aberta entre
 *   os dois só nos torneios com status "em-andamento": batalha amistosa fora de torneio não conta.
 * - Usa a primeira partida AINDA ABERTA (sem placar) entre os dois, na ordem das fases.
 * - Cada chamada é uma batalha. O confronto fecha quando alguém vence a maioria (MD1 = 1, MD3 = 2).
 *   MD padrão: fase de grupos = torneio.mdGrupos (1), mata-mata = torneio.mdMata (3).
 * - Ao fechar: preenche pa/pb/placar, soma KOs, guarda os times da última batalha, e no ranking
 *   dá +3 pontos e +1 vitória ao vencedor e +1 derrota ao perdedor. Se for a Final, define o campeão.
 * - battle_id repetido é ignorado (o servidor pode reenviar).
 */
import type { JogoPartida, LigaData, Partida, Torneio } from './ligaTipos';

export interface ResultadoBatalha {
  /** Opcional: sem ele, procura a partida aberta entre os dois nos torneios "Em andamento". */
  torneio_id?: string | null;
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

interface Achado {
  t: Torneio;
  W: { nick: string; trainer_id: string | null };
  L: { nick: string; trainer_id: string | null };
  candidatas: { p: Partida; i: number }[];
}

/** Partidas ainda abertas entre os dois, na ordem das fases. */
function abertas(t: Torneio, a: string, b: string) {
  return t.chave
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => !p.placar && ((mesmo(p.a, a) && mesmo(p.b, b)) || (mesmo(p.a, b) && mesmo(p.b, a))))
    .sort((x, y) => {
      const fx = ORDEM_FASES.indexOf(x.p.fase);
      const fy = ORDEM_FASES.indexOf(y.p.fase);
      return (fx < 0 ? 99 : fx) - (fy < 0 ? 99 : fy) || x.i - y.i;
    });
}

function noTorneio(liga: LigaData, id: string, r: ResultadoBatalha): Achado {
  const t = liga.torneios.find((x) => x.id === id);
  if (!t) throw new ErroResultado(404, `Torneio "${id}" não encontrado.`);
  const W = nickDoUuid(liga, t, r.winner_uuid);
  const L = nickDoUuid(liga, t, r.loser_uuid);
  const candidatas = abertas(t, W.nick, L.nick);
  if (!candidatas.length) throw new ErroResultado(409, `Nenhuma partida aberta entre ${W.nick} e ${L.nick} em "${t.nome}".`);
  return { t, W, L, candidatas };
}

function emAndamento(liga: LigaData, r: ResultadoBatalha): Achado {
  const ativos = liga.torneios.filter((t) => t.status === 'em-andamento');
  if (!ativos.length) throw new ErroResultado(409, 'Nenhum torneio em andamento: batalha tratada como amistosa.');
  for (const t of ativos) {
    let W, L;
    try {
      W = nickDoUuid(liga, t, r.winner_uuid);
      L = nickDoUuid(liga, t, r.loser_uuid);
    } catch {
      continue;
    }
    const candidatas = abertas(t, W.nick, L.nick);
    if (candidatas.length) return { t, W, L, candidatas };
  }
  throw new ErroResultado(409, 'Nenhuma partida aberta entre esses jogadores nos torneios em andamento: batalha tratada como amistosa.');
}

export function aplicarResultado(base: LigaData, r: ResultadoBatalha, agora = Date.now()): Aplicado {
  const liga: LigaData = structuredClone(base);
  if (mesmo(r.winner_uuid, r.loser_uuid)) throw new ErroResultado(400, 'Vencedor e perdedor são o mesmo jogador.');
  const achado = r.torneio_id ? noTorneio(liga, r.torneio_id, r) : emAndamento(liga, r);
  const { t, W, L } = achado;
  const { p, i } = achado.candidatas[0];

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
