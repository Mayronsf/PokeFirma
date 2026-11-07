/** Tipos da Liga (ranking + torneios). Sem imports: usado no site e nas funções /api. */
export type StatusTorneio = 'em-breve' | 'em-andamento' | 'encerrado';
export interface Jogador {
  nick: string;
  skin?: string;
  pontos: number;
  vitorias: number;
  derrotas: number;
  titulos: string[];
  /** Vínculo com a conta do Minecraft (preenchido ao escolher um jogador verificado). */
  trainer_id?: string | null;
  uuid?: string | null;
}
/** Uma batalha dentro do confronto (MD1/MD3), registrada pelo servidor Minecraft. */
export interface JogoPartida {
  id: string | null;
  vencedor: 'a' | 'b';
  koA: number;
  koB: number;
  timeA: number[];
  timeB: number[];
  em: number;
}
export interface Partida {
  fase: string;
  a: string | null;
  b: string | null;
  /** Texto do placar ("2–1"). Mantido em sincronia com pa/pb pelo painel. */
  placar: string | null;
  /** Grupo da partida (só na fase de grupos). */
  grupo?: string | null;
  /** Partidas (games) vencidas por A e por B. */
  pa?: number | null;
  pb?: number | null;
  /** Pokémon do adversário que A derrotou / que B derrotou. */
  koA?: number | null;
  koB?: number | null;
  /** Nº da Pokédex dos Pokémon que cada um levou para esta partida. */
  timeA?: number[];
  timeB?: number[];
  /** Batalhas já jogadas neste confronto (preenchido automaticamente pelo servidor). */
  jogos?: JogoPartida[];
  /** Melhor de quantas (1 ou 3). Vazio = padrão do torneio. */
  md?: number | null;
}
export interface Inscricao {
  nick: string;
  trainer_id?: string | null;
  uuid?: string | null;
  grupo?: string | null;
  /** Elenco inscrito (até 8, nº da Pokédex). */
  pokemon: number[];
}
export interface Torneio {
  id: string;
  nome: string;
  capitulo: number;
  formato: string;
  status: StatusTorneio;
  data: string | null;
  campeao: string | null;
  chave: Partida[];
  /** Nomes dos grupos ("A", "B"…). Vazio = grupo único. */
  grupos?: string[];
  /** Quantos de cada grupo vão para o mata-mata. */
  classificados?: number;
  inscritos?: Inscricao[];
  /** Melhor de quantas na fase de grupos (1 ou 3) e no mata-mata (padrão 3). */
  mdGrupos?: number;
  mdMata?: number;
}
export interface LigaData {
  exemplo: boolean;
  atualizadoEm: string;
  jogadores: Jogador[];
  torneios: Torneio[];
  /** Versão do documento: sobe a cada gravação (painel ou servidor). Evita um apagar a do outro. */
  rev?: number;
}
