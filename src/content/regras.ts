/** Regulamento — fonte: REGRAS_LIGA_POKEMON.md (v2.7.0). */

export const versaoRegulamento = '2.7.0';

export const temporadas = [
  {
    nome: 'Temporada 1: Liga Kanto',
    historia: '8 Ginásios (Brock até Giovanni com Mewtwo Nv. 80), Elite Four e Campeão Blue',
    estruturas: 'Santuários das Aves Lendárias (Articuno, Zapdos, Moltres), Templo de Mew e Usina de Energia',
    torneio: '1ª Copa Kanto — 6v6 Singles (1 Mega e/ou 1 Terastal por partida)',
  },
  {
    nome: 'Temporada 2: Liga Johto',
    historia: '8 Ginásios (Falkner até Clair), Equipe Rocket na Radio Tower e Campeão Lance',
    estruturas: 'Burned Tower (Feras Lendárias), Bell Tower (Ho-Oh), Whirl Islands (Lugia) e Santuário de Celebi',
    torneio: '2ª Copa Johto — 6v6 Singles + Defesa dos Ginásios dos Amigos',
  },
  {
    nome: 'Temporada 3: Liga Hoenn',
    historia: '8 Ginásios (Roxanne até Wallace), Cataclismo Climático e Campeão Steven Stone',
    estruturas: 'Magma Chamber (Groudon), Abyssal Cave (Kyogre), Sky Pillar (Rayquaza) e Templos dos Regis',
    torneio: '3ª Copa Hoenn — 6v6 Singles ou 4v4 Doubles VGC',
  },
  {
    nome: 'Temporada 4: Liga Sinnoh (Final)',
    historia: '8 Ginásios (Roark até Volkner), Ruptura do Espaço-Tempo e Campeã Cynthia',
    estruturas: 'Spear Pillar (Dialga, Palkia, Giratina), Três Lagos (Uxie, Mesprit, Azelf) e Hall of Origin (Arceus)',
    torneio: 'Grande Final Mundial & Copa Ubers — Vale-Tudo Nv. 100, Lendários liberados na chave especial',
  },
];

export const mecanicas = [
  'Mega Bracelet, Tera Orb, Z-Power Ring e Omni Ring valem desde o início: Ginásios, Masmorras, Raids e torneios.',
  'O Omni Ring funde Mega Bracelet, Z-Power Ring, Dynamax Band e Tera Orb (com Netherite, Circuitos de Elite do Mekanism e Cristais Niotic do Powah) e aciona os 4 fenômenos sem trocar de acessório.',
  'Nas Copas Kanto, Johto e Hoenn: no máximo 1 Mega Evolução e/ou 1 Terastal/Z-Move por batalha.',
  'Mega Rayquaza, Mega Mewtwo X/Y e as formas Primal de Groudon e Kyogre ficam restritas à Copa Ubers.',
];

export const clauses = [
  {
    nome: 'Species Clause',
    texto: 'Proibido levar dois Pokémon com o mesmo número da Pokédex Nacional no mesmo time de 6.',
  },
  {
    nome: 'Sleep Clause',
    texto:
      'Proibido deixar mais de 1 Pokémon adversário dormindo ao mesmo tempo com golpes como Spore, Sleep Powder, Hypnosis ou Yawn. Rest usado pelo próprio oponente não conta.',
  },
  {
    nome: 'Evasion & OHKO Clause',
    texto:
      'Proibidos golpes que aumentam a Evasão (Double Team, Minimize) e golpes de nocaute instantâneo (Fissure, Guillotine, Horn Drill, Sheer Cold).',
  },
  {
    nome: 'Bag Items Clause',
    texto:
      'Proibido usar itens de cura da mochila (Poções, Revives, Full Restore) em duelos entre jogadores. Só Held Items, como Leftovers, Choice Band, Focus Sash, Life Orb e Assault Vest.',
  },
  {
    nome: 'Level Cap com folga',
    texto:
      'Os Ginásios usam o teto de nível do RCT, com folga de segurança de +5 a +8 níveis acima do aceito pelo Líder, para nenhum Pokémon desobedecer por 1 nível.',
  },
];

export const golpesEvasao = ['double-team', 'minimize'];
export const golpesOHKO = ['fissure', 'guillotine', 'horn-drill', 'sheer-cold'];
export const golpesSono = ['spore', 'sleep-powder', 'hypnosis', 'yawn', 'sing', 'lovely-kiss', 'grass-whistle', 'dark-void'];

export const formatoTorneio = [
  {
    nome: 'Inscrição de elenco (8 Pokémon)',
    texto:
      'Antes de cada Copa, cada jogador inscreve 8 Pokémon. Antes de cada partida, você vê o elenco do adversário e escolhe os 6 que entram em campo.',
  },
  {
    nome: 'Fase de grupos',
    texto:
      'Todos contra todos em MD1 ou MD3. Vitória vale 3 pontos, derrota 0. Desempate pelo saldo de Pokémon sobreviventes.',
  },
  {
    nome: 'Playoffs (MD3)',
    texto:
      'Os 4 melhores disputam semifinais e a Grande Final. Entre partidas da MD3 dá para trocar Held Items e substituir até 2 Pokémon do elenco.',
  },
  {
    nome: 'Premiação',
    texto:
      'Estátua no Hall da Fama da Arena Central, troféu simbólico e, no jogo, Master Ball, Golden Bottle Cap e Shiny Card.',
  },
];

export const filosofiaCLT = [
  { nome: 'Loot dividido (Lootr)', texto: 'Cada jogador recebe o próprio loot nos baús de masmorras, templos e acampamentos.' },
  {
    nome: 'Drops otimizados',
    texto: 'Pedras evolutivas, doces de experiência, vitaminas e Tera Shards nos baús: dá para progredir em sessões de 30 a 45 minutos.',
  },
  { nome: 'FTB Ultimine', texto: 'Segure ~ (Grave) para quebrar veios de minério ou árvores inteiras de uma vez.' },
  { nome: 'Waystones', texto: 'Volte para a base ou reúna a Firma num clique, sem caminhar por distâncias vazias.' },
];

export const targetDummy =
  'O Boneco de Treino (Target Dummy) é a ferramenta oficial de treino: monte com 1 Fardo de Feno e 1 Suporte de Armaduras, vista qualquer armadura e veja dano flutuante e DPS para testar golpes e EVs antes das partidas valendo pontos.';
