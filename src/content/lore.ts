/**
 * Lore oficial — fonte: HISTORIA_E_RP_FIRMA_LEAGUE.md.
 * Texto reescrito para caber no layout. Não adicionar fatos que não estejam no documento.
 */
import type { Chapter } from '../config';

export const convergencia = {
  titulo: 'A Grande Convergência',
  resumo: [
    'Kanto, Johto, Hoenn e Sinnoh existiam separadas por oceanos, até que um evento catastrófico, a Grande Convergência, fundiu pedaços das quatro regiões num mesmo continente.',
    'A fusão espalhou Cristais de Energia Mega e Terastal pelo subsolo, e facções criminosas querem usar a Convergência para capturar os Lendários e controlar o mundo.',
    'A Associação Pokémon selou as Ligas superiores com um Bloqueio de Nível e convocou a Firma para investigar a Anomalia, derrotar os Líderes e Campeões corrompidos pela fenda e disputar o posto de Grande Campeão da Firma League.',
  ],
  porQueOsGinasios:
    'É isso que explica por que Ginásios, Torres Lendárias e biomas de todas as gerações coexistem no mesmo mundo.',
};

export const colapso = {
  titulo: 'O Colapso Tecnológico',
  texto: [
    'O pulso eletromagnético da Grande Convergência causou uma pane generalizada: toda a tecnologia da Silph Co. e da Devon Corp entrou em curto-circuito.',
    'Pokébolas de ferro primitivas quebravam ao tentar conter Pokémon expostos à energia da fenda; PCs, Centros Pokémon e Estações de Cura descalibraram os circuitos; a logística precisou ser reinventada do zero.',
    'Os cientistas sobreviventes entregaram à Firma os manuais da Engenharia da Convergência, unindo a força mecânica do Create, a precisão industrial do Mekanism, a bio-energia do Powah!, a rede quântica do Applied Energistics 2 e a automação do Industrial Foregoing, integrados por scripts do KubeJS. São 4 Eras Tecnológicas pensadas para a rotina de quem trabalha: progressão fluida, sem grind maçante.',
  ],
};

export interface EraItem {
  nome: string;
  id?: string;
}
export interface Era {
  numero: number;
  regiao: string;
  titulo: string;
  chave: EraItem[];
  libera: string[];
  nota?: string;
}

export const eras: Era[] = [
  {
    numero: 1,
    regiao: 'Kanto',
    titulo: 'Automação Cinética, Chapas de Ferro & Circuitos de Apricorn',
    chave: [
      { nome: 'Chapa de Ferro', id: 'create:iron_sheet' },
      { nome: 'Liga de Andesito', id: 'create:andesite_alloy' },
      { nome: 'Circuito Básico de Controle', id: 'mekanism:basic_control_circuit' },
    ],
    libera: [
      'Pokébolas Tier 2 (Great, Fast, Heavy…)',
      'Fornalhas de Ferro e Mochilas reforçadas',
      'PC Pokémon e Healing Machine',
      'Pasture, Bússolas e terminais do Tom’s Storage',
    ],
    nota: 'O ferro bruto passa pela Prensa Mecânica do Create. O Circuito Básico de Controle combina Redstone, ferro prensado e a bio-energia das Apricorns.',
  },
  {
    numero: 2,
    regiao: 'Johto',
    titulo: 'Termodinâmica, Ligas Infundidas & Orbe de Energização',
    chave: [
      { nome: 'Orbe de Energização', id: 'powah:energizing_orb' },
      { nome: 'Aço Energizado', id: 'powah:steel_energized' },
      { nome: 'Ligas Infundidas' },
      { nome: 'Cristais Blazing' },
    ],
    libera: [
      'Pokébolas Tier 3 (Ultra, Quick, Dusk, Timer…)',
      'Mega Bracelet e Tera Orb',
      'Link Cable, Upgrade (Porygon2), Dubious Disc (Porygon-Z) e Ability Capsules',
    ],
    nota: 'A Câmara Metalúrgica (Metallurgic Infuser) do Mekanism e o Orbe de Energização dominam a radiação dimensional.',
  },
  {
    numero: 3,
    regiao: 'Hoenn',
    titulo: 'O Omni Ring 4-em-1 & Redes Quânticas',
    chave: [
      { nome: 'Omni Ring', id: 'mega_showdown:omni_ring' },
      { nome: 'Circuitos de Elite (Mekanism)' },
      { nome: 'Cristais Niotic (Powah!)' },
      { nome: 'Sky Stone e Certus Quartz (AE2)' },
    ],
    libera: [
      'Omni Ring: Mega, Z-Move, Dynamax e Terastal no mesmo acessório',
      'PC Portátil Quântico (Box Link)',
      'Redes digitais de itens do Applied Energistics 2',
    ],
    nota: 'Omni Ring = Mega Bracelet + Z-Power Ring + Dynamax Band + Tera Orb + Netherite + 2 Circuitos de Elite do Mekanism + 2 Cristais Niotic do Powah!.',
  },
  {
    numero: 4,
    regiao: 'Sinnoh',
    titulo: 'Engenharia Genética, Master Ball & Treino de Precisão',
    chave: [{ nome: 'Circuitos Supremos de Controle' }, { nome: 'Ligas Atômicas' }, { nome: 'Cristais Nitro' }],
    libera: [
      'Master Ball, a “Esfera Suprema de Contenção Espaço-Tempo”',
      'Silver & Golden Bottle Caps (IVs 31)',
      'Ability Patch (Hidden Ability)',
      'Boneco de Treino, que mede o dano de cada golpe antes das finais',
    ],
  },
];

export interface Lendario {
  nome: string;
  dex: number;
  local: string;
  capitulo: Chapter;
}

export interface Capitulo {
  numero: Chapter;
  regiao: 'Kanto' | 'Johto' | 'Hoenn' | 'Sinnoh';
  titulo: string;
  destaque: { nome: string; dex: number };
  ameacaRotulo: 'Vilão' | 'Ameaça';
  ameaca: string;
  acontecendo: string[];
  viloes: string[];
  locais: string[];
  ginasios: string;
  campeao: string;
  climax: string[];
  torneio: { nome: string; texto: string };
}

export const capitulos: Capitulo[] = [
  {
    numero: 1,
    regiao: 'Kanto',
    titulo: 'O Projeto Genético da Equipe Rocket',
    destaque: { nome: 'Mewtwo', dex: 150 },
    ameacaRotulo: 'Vilão',
    ameaca: 'Giovanni e a Equipe Rocket',
    acontecendo: [
      'A Equipe Rocket, liderada por Giovanni, foi a primeira a descobrir como explorar a Convergência.',
      'Eles saquearam o antigo Templo de Mew (Overgrown Temple) na selva para roubar o DNA ancestral e usaram a energia da Power Plant, a Usina de Zapdos, para criar Mewtwo.',
    ],
    viloes: ['Giovanni', 'Archer (Admin Rocket)', 'Ariana (Admin Rocket)'],
    locais: ['Overgrown Temple (Templo de Mew)', 'Power Plant (Usina de Zapdos)', 'Redutos da Equipe Rocket'],
    ginasios:
      'Brock, Misty, Lt. Surge, Erika, Koga, Sabrina e Blaine guardam os selos da Liga de Indigo. A cada Líder derrotado, o Trainer Card libera mais poder para enfrentar os Admins da Rocket.',
    campeao: 'Elite Four e Campeão Blue',
    climax: [
      'A Firma invade os redutos da Rocket e derrota Giovanni e seu Mewtwo (Nv. 80). Ele foge e deixa cair dados sobre um sinal misterioso vindo de Johto.',
      'A Firma vence a Elite Four e o Campeão Blue.',
    ],
    torneio: {
      nome: 'Copa Kanto',
      texto: 'Antes de partir para Johto, os membros da Firma se enfrentam na Arena para definir o 1º Campeão Regional da Firma.',
    },
  },
  {
    numero: 2,
    regiao: 'Johto',
    titulo: 'O Eco das Torres Queimadas',
    destaque: { nome: 'Ho-Oh', dex: 250 },
    ameacaRotulo: 'Vilão',
    ameaca: 'Generais remanescentes da Equipe Rocket',
    acontecendo: [
      'Com Giovanni derrotado, os generais remanescentes da Rocket tomam a Radio Tower de Johto e usam a antena para emitir ondas que forçam o despertar dos Lendários.',
      'O sinal atinge Ecruteak: da Burned Tower, Raikou, Entei e Suicune se espalham pelo mapa; no topo da Bell Tower, Ho-Oh observa a fenda; nas Whirl Islands, Lugia desperta agitado; e no santuário da Ilex Forest, Celebi tenta conter a distorção temporal.',
    ],
    viloes: ['Generais remanescentes da Equipe Rocket'],
    locais: ['Radio Tower', 'Burned Tower', 'Bell Tower', 'Whirl Islands', 'Ilex Forest'],
    ginasios: '8 Insígnias de Johto, de Falkner até Clair.',
    campeao: 'Mestre de Dragões e Campeão Lance',
    climax: [
      'A Firma conquista as 8 Insígnias, liberta a Radio Tower, explora as Torres de Ho-Oh e Lugia e derrota Lance.',
      'Lance revela que os abalos em Johto eram só o reflexo de algo maior nas placas tectônicas e nos oceanos de Hoenn.',
    ],
    torneio: {
      nome: 'Copa Johto',
      texto: 'O 2º campeonato oficial da Firma, para testar os novos times antes da expedição para Hoenn.',
    },
  },
  {
    numero: 3,
    regiao: 'Hoenn',
    titulo: 'O Despertar dos Titãs Primordiais',
    destaque: { nome: 'Rayquaza', dex: 384 },
    ameacaRotulo: 'Ameaça',
    ameaca: 'O choque entre Groudon e Kyogre',
    acontecendo: [
      'A energia das Mega Evoluções e das fendas acordou os criadores do continente e do oceano: Groudon, no Groudon Volcano, e Kyogre, no Kyogre Dome.',
      'O choque entre os dois desestabiliza o clima do planeta, ativa os três Titan Temples de Regirock, Regice e Registeel e atrai um meteorito do espaço carregando Deoxys.',
    ],
    viloes: ['Cataclismo climático de Groudon × Kyogre'],
    locais: ['Groudon Volcano', 'Kyogre Dome', 'Titan Temples', 'Sky Pillar'],
    ginasios: '8 Líderes de Hoenn, de Roxanne até Wallace.',
    campeao: 'Elite Four de Hoenn e Campeão Steven Stone (com seu Mega Metagross)',
    climax: [
      'Enquanto vence os Líderes, a Firma precisa encontrar o Sky Pillar e subir até as nuvens para despertar Rayquaza, o único capaz de acalmar Groudon e Kyogre.',
      'Contido o cataclismo, a Firma derrota a Elite Four e Steven Stone.',
      'Steven descobre a verdade: a Grande Convergência foi causada por uma ruptura no próprio Tempo e Espaço, originada no topo do Spear Pillar, em Sinnoh.',
    ],
    torneio: { nome: 'Copa Hoenn', texto: 'O 3º grande torneio da Firma League.' },
  },
  {
    numero: 4,
    regiao: 'Sinnoh',
    titulo: 'A Ruptura no Spear Pillar e o Trono Mundial',
    destaque: { nome: 'Arceus', dex: 493 },
    ameacaRotulo: 'Ameaça',
    ameaca: 'A ruptura do Espaço-Tempo e o Mundo Distorcido',
    acontecendo: [
      'Tudo convergiu para Sinnoh. A barreira entre o nosso mundo e o Mundo Distorcido está se rompendo pela Turnback Cave.',
      'Para fechar a fenda de vez, a Firma passa pelo teste dos guardiões dos lagos, vence os 8 Ginásios mais difíceis do mundo e sobe ao Spear Pillar para enfrentar Dialga, Palkia, Giratina e, no Hall of Origin, Arceus.',
    ],
    viloes: ['Ruptura do Espaço-Tempo'],
    locais: ['Turnback Cave', 'Lake Acuity', 'Lake Verity', 'Lake Valor', 'Spear Pillar / Temple of Sinnoh', 'Hall of Origin'],
    ginasios: '8 Ginásios mais difíceis do mundo, de Roark até Volkner.',
    campeao: 'Campeã Cynthia, a guardiã final da Liga',
    climax: [
      'Com o espaço-tempo estabilizado, resta apenas a Campeã Cynthia.',
      'Quando todos derrotam Cynthia, a história PvE é zerada.',
    ],
    torneio: {
      nome: 'Grande Final — Liga Mundial & Copa Ubers',
      texto: 'O momento mais esperado do servidor: a Firma usa tudo o que conquistou nas 4 regiões para coroar o Campeão Supremo.',
    },
  },
];

export const lendarios: Lendario[] = [
  { nome: 'Mew', dex: 151, local: 'Overgrown Temple', capitulo: 1 },
  { nome: 'Mewtwo', dex: 150, local: 'Criado pela Rocket com a energia da Power Plant', capitulo: 1 },
  { nome: 'Zapdos', dex: 145, local: 'Power Plant', capitulo: 1 },
  { nome: 'Raikou', dex: 243, local: 'Burned Tower', capitulo: 2 },
  { nome: 'Entei', dex: 244, local: 'Burned Tower', capitulo: 2 },
  { nome: 'Suicune', dex: 245, local: 'Burned Tower', capitulo: 2 },
  { nome: 'Ho-Oh', dex: 250, local: 'Bell Tower', capitulo: 2 },
  { nome: 'Lugia', dex: 249, local: 'Whirl Islands', capitulo: 2 },
  { nome: 'Celebi', dex: 251, local: 'Santuário da Ilex Forest', capitulo: 2 },
  { nome: 'Groudon', dex: 383, local: 'Groudon Volcano', capitulo: 3 },
  { nome: 'Kyogre', dex: 382, local: 'Kyogre Dome', capitulo: 3 },
  { nome: 'Regirock', dex: 377, local: 'Titan Temples', capitulo: 3 },
  { nome: 'Regice', dex: 378, local: 'Titan Temples', capitulo: 3 },
  { nome: 'Registeel', dex: 379, local: 'Titan Temples', capitulo: 3 },
  { nome: 'Deoxys', dex: 386, local: 'Meteorito vindo do espaço', capitulo: 3 },
  { nome: 'Rayquaza', dex: 384, local: 'Sky Pillar', capitulo: 3 },
  { nome: 'Uxie', dex: 480, local: 'Lake Acuity', capitulo: 4 },
  { nome: 'Mesprit', dex: 481, local: 'Lake Verity', capitulo: 4 },
  { nome: 'Azelf', dex: 482, local: 'Lake Valor', capitulo: 4 },
  { nome: 'Dialga', dex: 483, local: 'Spear Pillar / Temple of Sinnoh', capitulo: 4 },
  { nome: 'Palkia', dex: 484, local: 'Spear Pillar / Temple of Sinnoh', capitulo: 4 },
  { nome: 'Giratina', dex: 487, local: 'Spear Pillar · Mundo Distorcido', capitulo: 4 },
  { nome: 'Arceus', dex: 493, local: 'Hall of Origin', capitulo: 4 },
];

/**
 * Insígnias por região. A arte vem da PokéAPI (sprites/badges/{n}.png: 1–8 Kanto, 9–16 Johto,
 * 17–24 Hoenn, 25–32 Sinnoh, na ordem dos ginásios). Líderes só onde o documento cita o nome.
 */
export interface Insignia {
  id: string;
  nome: string;
  lider?: string;
  badge?: number;
}
const reg = (regiao: string, base: number, nomes: string[], lideres: Record<number, string>, elite: string, campeao: string): Insignia[] => [
  ...nomes.map((n, i) => ({ id: `${regiao}-${i + 1}`, nome: n, lider: lideres[i + 1], badge: base + i })),
  { id: `${regiao}-elite`, nome: 'Elite Four', lider: elite },
  { id: `${regiao}-campeao`, nome: 'Campeão', lider: campeao },
];

export const insignias: { regiao: string; capitulo: Chapter; itens: Insignia[] }[] = [
  {
    regiao: 'Kanto',
    capitulo: 1,
    itens: reg('kanto', 1,
      ['Boulder Badge', 'Cascade Badge', 'Thunder Badge', 'Rainbow Badge', 'Soul Badge', 'Marsh Badge', 'Volcano Badge', 'Earth Badge'],
      { 1: 'Brock', 2: 'Misty', 3: 'Lt. Surge', 4: 'Erika', 5: 'Koga', 6: 'Sabrina', 7: 'Blaine', 8: 'Giovanni' }, 'Liga de Indigo', 'Blue'),
  },
  {
    regiao: 'Johto',
    capitulo: 2,
    itens: reg('johto', 9,
      ['Zephyr Badge', 'Hive Badge', 'Plain Badge', 'Fog Badge', 'Storm Badge', 'Mineral Badge', 'Glacier Badge', 'Rising Badge'],
      { 1: 'Falkner', 8: 'Clair' }, 'Liga de Johto', 'Lance'),
  },
  {
    regiao: 'Hoenn',
    capitulo: 3,
    itens: reg('hoenn', 17,
      ['Stone Badge', 'Knuckle Badge', 'Dynamo Badge', 'Heat Badge', 'Balance Badge', 'Feather Badge', 'Mind Badge', 'Rain Badge'],
      { 1: 'Roxanne', 8: 'Wallace' }, 'Liga de Hoenn', 'Steven Stone'),
  },
  {
    regiao: 'Sinnoh',
    capitulo: 4,
    itens: reg('sinnoh', 25,
      ['Coal Badge', 'Forest Badge', 'Cobble Badge', 'Fen Badge', 'Relic Badge', 'Mine Badge', 'Icicle Badge', 'Beacon Badge'],
      { 1: 'Roark', 8: 'Volkner' }, 'Liga de Sinnoh', 'Cynthia'),
  },
];

export const badgeUrl = (n: number) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/badges/${n}.png`;