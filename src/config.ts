/**
 * Firma League — configurações do site num só lugar.
 * Tudo que estiver como "[A DEFINIR]" ou null aparece no site com o selo [A DEFINIR].
 */

import type { Membro } from './lib/skins';

export const A_DEFINIR = '[A DEFINIR]';

export const config = {
  servidor: {
    /** IP/host do servidor. Ex.: "jogar.firmaleague.com.br". Deixe null até definir. */
    ip: null as string | null,
    /** Limite de jogadores exibido quando a API de status não informar. */
    limiteJogadores: null as number | null,
    /** Intervalo de atualização do status, em segundos. */
    atualizarCadaSegundos: 60,
    /** API pública de status. {ip} é substituído pelo IP acima. */
    statusApi: 'https://api.mcsrvstat.us/3/{ip}',
  },

  modpack: {
    nome: 'Firma League: Cobblemon, Tech & História',
    versao: '2.7.0',
    /** Data de publicação da versão, formato ISO (aaaa-mm-dd). */
    dataVersao: null as string | null,
    minecraft: '1.21.1',
    loader: 'NeoForge',
    loaderVersao: '21.1.248',
    java: 'Java 21',
    ramCliente: '4 GB a 6 GB',
    ramServidor: '6 GB a 8 GB',
    modsCliente: 122,
    modsServidor: 109,
    downloads: {
      /** Cliente completo: Firma-League-NeoForge-2.7.0.zip */
      cliente: null as string | null,
      /** Atualização rápida: Firma-League-NeoForge-Atualizacao.zip (98.6 MB) */
      atualizacao: null as string | null,
      /** Servidor dedicado: Firma-League-Server-NeoForge-2.7.0.zip (301.4 MB) */
      servidor: null as string | null,
    },
  },

  redes: {
    discord: 'https://discord.gg/AXHBrMEpea' as string | null,
    youtube: null as string | null,
    tiktok: null as string | null,
  },

  /**
   * Level cap por capítulo (formato História). null = ainda não definido.
   * Fonte prevista: config/rctmod-server.toml do modpack.
   */
  levelCaps: {
    1: null,
    2: null,
    3: null,
    4: null,
  } as Record<1 | 2 | 3 | 4, number | null>,

  /** Folga de segurança sobre o level cap, segundo o regulamento (+5 a +8). */
  folgaLevelCap: { min: 5, max: 8 },

  /**
   * Membros da Firma nos renders do site: [0] e [1] = laterais do card da Home, [2] e [3] = rodapé.
   * Cada item pode ser só o nick (skin puxada pelo nick) ou { nick, skin } com o arquivo .png
   * da skin em public/assets/skins/ (ex.: { nick: 'Fulano', skin: '/assets/skins/fulano.png' }).
   * MHF_Steve / MHF_Alex são skins padrão — troque pelos membros reais.
   */
  membros: [
    { nick: 'Mayronsf', skin: '/assets/skins/mayron.png' },
    { nick: 'Ryan', skin: '/assets/skins/ryan.png?v=2' },
    { nick: 'Ryan', skin: '/assets/skins/ryan.png?v=2' },
    { nick: 'Mayronsf', skin: '/assets/skins/mayron.png' },
  ] as Membro[],

  /**
   * Prints do mundo do modpack (coloque os arquivos em public/assets/mundo/).
   * Enquanto estiverem null, o site desenha uma paisagem em pixel no lugar.
   */
  imagens: {
    heroMundo: null as string | null,
    rankingMundo: null as string | null,
  },

  /** Banidos por formato. O regulamento ainda não lista espécies banidas: [A DEFINIR]. */
  banidos: {
    singles: [] as string[],
    ubers: [] as string[],
  },

  /** Nível máximo por formato. null = [A DEFINIR]. */
  nivelMaximo: {
    singles: null as number | null,
    ubers: 100,
  },

  desenvolvedor: 'Fourtech Solutions',
};

export type Chapter = 1 | 2 | 3 | 4;
