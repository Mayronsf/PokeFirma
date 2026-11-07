/** Lista de mods (curada) — fonte: MODLIST_E_INSTALACAO.md e MODLIST.md do modpack (v2.8.0, NeoForge 1.21.1). */

export interface Mod {
  nome: string;
  arquivos: string[];
  funcao: string;
  lado?: 'Cliente' | 'Servidor' | 'Ambos';
}
export interface Categoria {
  id: string;
  nome: string;
  mods: Mod[];
}

export const categorias: Categoria[] = [
  {
    id: 'cobblemon',
    nome: 'Cobblemon & Addons Pokémon',
    mods: [
      { nome: 'Cobblemon', arquivos: ['Cobblemon-neoforge-1.8.4+1.21.1.jar'], funcao: 'Mod principal de Pokémon em mundo aberto.' },
      { nome: 'Mega Showdown', arquivos: ['mega_showdown-neoforge-1.3.3+1.8.4+1.21.1-release.jar'], funcao: 'Mega Evolução, Terastal, Z-Moves, Dynamax e o Omni Ring.' },
      { nome: 'Z-A Mega', arquivos: ['zamega-neoforge-1.8.2+1.8.2.jar'], funcao: 'Novas Mega Evoluções inspiradas em Legends Z-A (83 Mega Stones no sorteio).' },
      { nome: 'Cobblemon Raid Dens', arquivos: ['cobblemonraiddens-neoforge-0.13.5+1.21.1.jar'], funcao: 'Raids cooperativas (Tiers 1 a 7) inspiradas em Sword/Shield e Scarlet/Violet.' },
      { nome: 'MissingMons', arquivos: ['missingmons-cobblemon-3.6.1.jar'], funcao: 'Mais de uma centena de espécies adicionais.' },
      { nome: 'Pasture Loot & Safe Pastures', arquivos: ['PastureLoot-neoforge-2.0.0+1.21.1.jar', 'SafePastures(Neoforge)-1.1.2+1.21.1.jar'], funcao: 'Pokémon no pasto soltam drops e ficam protegidos contra dano.' },
      { nome: 'Cobbreeding', arquivos: ['Cobbreeding-neoforge-2.4.1.jar'], funcao: 'Cruzamento e ovos no Pasture Block (IVs, Natures e Egg Moves).' },
      { nome: 'Cobblemon Utility+', arquivos: ['Cobblemon-Utility+-neoforge-1.8.0.jar'], funcao: 'Silver e Golden Bottle Caps e penas de ajuste de EVs.' },
      { nome: 'Cobblemon Battle Extras', arquivos: ['cobblemon-battle-extras-neoforge-1.13.45.jar'], funcao: 'HUD estilo Showdown: clima, terreno, Trick Room, hazards e buffs.' },
      { nome: 'Cobblemon Effectiveness', arquivos: ['cobeffectiveness-neoforge-0.4.0-beta.1.jar'], funcao: 'Destaca golpes super efetivos (2x, 4x) nos botões de ataque.' },
      { nome: 'Cobblemon Spawn Notification', arquivos: ['spawnnotification-neoforge-1.8.4-2.3.0.jar'], funcao: 'Avisa no chat quando Shinies, Lendários ou Alphas aparecem por perto.' },
      { nome: 'Cobblemon PokéNav', arquivos: ['cobblenav-neoforge-2.4.2.jar'], funcao: 'Radar que mostra o que spawna no bioma.' },
      { nome: 'Cobblemon Box Link', arquivos: ['cobblemonboxlink-neoforge-1.21.1-1.0.6.jar'], funcao: 'PC Pokémon portátil em qualquer lugar do mapa.' },
      { nome: 'Cobblemon Wiki GUI', arquivos: ['CobblemonWikiGui-neoforge-2.7.1+1.21.1.jar'], funcao: '/pwiki para consultar evoluções, biomas e status no jogo.' },
      { nome: 'Cobblemon Integrations', arquivos: ['cobblemonintegrations-neoforge-1.21.1-1.1.8.jar'], funcao: 'Integração com Jade e minimapas.' },
      { nome: 'Player XP & Capture XP', arquivos: ['playerxp-neoforge-1.1.2+1.21.1.jar', 'capturexp-neoforge-1.8.4-1.3.0.jar'], funcao: 'Batalhas e capturas dão experiência de jogador.' },
      { nome: 'Myths and Legends & Legendary Structures', arquivos: ['MythsAndLegends-neoforge-1.9.0.jar', 'cobblemon-legendary-structures-2.2.jar'], funcao: 'Invocações e estruturas lendárias (Sky Pillar, Tera Dens, Santuários).' },
      { nome: 'Fight or Flight', arquivos: ['fightorflight-neoforge-0.11.1.jar'], funcao: 'Pokémon selvagens agressivos podem revidar.' },
      { nome: 'Release Rewards, Unchained & Counter', arquivos: ['releaserewards-neoforge-3.0.4.jar', 'unchained-neoforge-1.8.4-1.7.4.jar', 'counter-neoforge-1.8.4-1.9.4.jar'], funcao: 'Recompensas ao soltar Pokémon, bônus de IV/Shiny em cadeias e contador na HUD.' },
      { nome: 'Cobblemon Outbreaks', arquivos: ['cobblemon_outbreaks-neoforge-1.1.2.jar'], funcao: 'Surtos em massa no estilo Scarlet/Violet, com chance de shiny que aumenta.' },
      { nome: 'Cobbleworkers', arquivos: ['cobbleworkers-neoforge-2.0.7+1.8.3.jar'], funcao: 'Pokémon no Pasture trabalham: colhem plantações, Apricorns e outros recursos conforme o tipo.' },
      { nome: 'SimpleTMs', arquivos: ['SimpleTMs-neoforge-2.3.3.jar'], funcao: 'TMs e TRs como itens para ensinar golpes.' },
      { nome: 'Only Bottle Caps', arquivos: ['Only Bottle Caps-1.5.0-neoforge.jar'], funcao: 'Bottle Caps para maximizar IVs.' },
      { nome: 'Catch Indicator & Catch Rate Display', arquivos: ['catchindicator-neoforge-3.0.jar', 'catchrate-display-neoforge-2.12.3.jar'], funcao: 'Mostra se a espécie já foi capturada e a chance de captura de cada Pokébola na batalha.' },
      { nome: 'Cobblemon Pokémon Badges & Badge Box', arquivos: ['cobblemonpokemonbadges-neoforge-0.1.1.jar', 'badgebox-neoforge-1.3.0.jar'], funcao: 'Todas as insígnias da série principal como itens e o estojo de insígnias do anime.' },
      { nome: 'Cobblemon Smartphone', arquivos: ['cobblemon_smartphone-neoforge-2.0.1.jar'], funcao: 'Celular com um Rotom: cura o time e abre o PC e o Ender Chest de qualquer lugar.' },
      { nome: 'CobbleDollars', arquivos: ['CobbleDollars-neoforge-2.0.0+Beta-6.1+1.21.1.jar'], funcao: 'Moeda Pokémon e lojas para comprar e vender itens.' },
      { nome: 'Cobblemon Size Variation', arquivos: ['CobblemonSizeVariationNeoforge-1.4.0+1.7.0.jar'], funcao: 'Pokémon com tamanhos variados, alguns bem menores ou maiores que o normal.' },
      { nome: 'More Cobblemon Tweaks', arquivos: ['MoreCobblemonTweaks-neoforge-1.3.6.jar'], funcao: 'Ajustes de interface e qualidade de vida no Cobblemon.' },
    ],
  },
  {
    id: 'masmorras',
    nome: 'Masmorras, Exploração & Combate',
    mods: [
      { nome: 'Dungeons and Taverns', arquivos: ['dungeons-and-taverns-v4.4.4.jar'], funcao: 'Masmorras, criptas, tavernas e fortalezas com salas secretas.' },
      { nome: 'Artifacts', arquivos: ['artifacts-neoforge-13.2.5.jar'], funcao: 'Relíquias passivas em acampamentos.' },
      { nome: 'Simply Swords', arquivos: ['simplyswords-neoforge-1.70.2-1.21.1.jar'], funcao: 'Armas temáticas com habilidades e a Forja Rúnica.' },
      { nome: 'Simply Tooltips & Fzzy Config', arquivos: ['SimplyTooltips-neoforge-0.1.5.jar', 'fzzy_config-0.7.7+fix1+1.21+neoforge.jar'], funcao: 'Tooltips modernas e configuração do Simply Swords.' },
      { nome: 'Target Dummy (MmmMmmMmmMmm)', arquivos: ['dummmmmmy-1.21-2.1.2-neoforge.jar'], funcao: 'Boneco de treino com dano flutuante e medição de DPS.' },
      { nome: 'Moonlight Lib', arquivos: ['moonlight-1.21.1-3.8.2-neoforge.jar'], funcao: 'Biblioteca de renderização (suporte do Dummy).' },
      { nome: 'Sparse Structures', arquivos: ['sparsestructures-neoforge-1.21.1-3.0.jar'], funcao: 'Afasta masmorras para não esmagarem vilas e Centros Pokémon.' },
      { nome: 'Explorer’s & Nature’s Compass', arquivos: ['ExplorersCompass-1.21.1-3.4.0-neoforge.jar', 'NaturesCompass-1.21.1-3.4.0-neoforge.jar'], funcao: 'Bússolas para estruturas e biomas.' },
      { nome: 'Waystones', arquivos: ['waystones-neoforge-1.21.1-21.1.46.jar'], funcao: 'Teleporte entre bases, vilas, ginásios e arenas.' },
      { nome: 'Lootr', arquivos: ['lootr-neoforge-1.21.1-1.11.38.127.jar'], funcao: 'Loot individual por jogador em baús de estruturas.' },
      { nome: 'Legendary Monuments', arquivos: ['legendarymonuments-neoforge-1.21.1-8.2-Keep-Fighting.jar'], funcao: 'Formas especiais de encontrar Lendários e Míticos (Regis, Zacian, Reshiram, Hoopa…).' },
      { nome: 'Repurposed Structures', arquivos: ['repurposed_structures-7.5.22+1.21.1-neoforge.jar'], funcao: 'Variações de vilas, templos e masmorras para cada bioma.' },
      { nome: 'Xaero’s Minimap & World Map', arquivos: ['xaerominimap-neoforge-1.21.1-26.6.0.jar', 'xaeroworldmap-neoforge-1.21.1-1.47.0.jar'], funcao: 'Minimapa na tela e mapa-múndi com pontos marcados (waypoints).' },
    ],
  },
  {
    id: 'tech',
    nome: 'Engenharia Tech, Automação & Logística',
    mods: [
      { nome: 'Create', arquivos: ['create-1.21.1-6.0.10.jar'], funcao: 'Engenharia cinética para fabricar Pokébolas.' },
      { nome: 'Create Crafts & Additions', arquivos: ['createaddition-1.7.2.jar'], funcao: 'Liga a energia rotacional do Create à rede RF/FE.' },
      { nome: 'Mekanism', arquivos: ['Mekanism-1.21.1-10.7.19.85.jar'], funcao: 'Processamento químico, refino de metais e Circuitos de Controle.' },
      { nome: 'Mekanism Generators & Tools', arquivos: ['MekanismGenerators-1.21.1-10.7.19.85.jar', 'MekanismTools-1.21.1-10.7.19.85.jar'], funcao: 'Reatores, geradores e ferramentas industriais.' },
      { nome: 'Powah!', arquivos: ['Powah-6.2.10.jar'], funcao: 'Energizing Orb, Aço Energizado e Cristais para itens de elite.' },
      { nome: 'Applied Energistics 2', arquivos: ['appliedenergistics2-19.2.18.jar'], funcao: 'Armazenamento digital em discos e automação.' },
      { nome: 'Industrial Foregoing & Titanium', arquivos: ['industrialforegoing-1.21-3.6.39.jar', 'titanium-1.21-4.0.52.jar'], funcao: 'Extratores de fluidos, lasers de mineração e automação de pastos.' },
      { nome: 'Tom’s Simple Storage', arquivos: ['toms_storage-1.21-2.4.2.jar'], funcao: 'Terminal de inventário unificado com busca e acesso sem fio.' },
      { nome: 'Better Furnaces Reforged', arquivos: ['BetterFurnacesReforged-1.21.1-1.1.2518.1-neoforge.jar'], funcao: 'Fornalhas de Cobre a Netherite, de alta velocidade.' },
      { nome: 'Sophisticated Backpacks & Storage', arquivos: ['sophisticatedbackpacks-1.21.1-3.26.20.2244.jar', 'sophisticatedstorage-1.21.1-1.6.16.2222.jar'], funcao: 'Mochilas e baús com upgrades de ímã, auto-alimentação e filtros.' },
    ],
  },
  {
    id: 'kubejs',
    nome: 'KubeJS, Receitas Integradas & Regras da Liga',
    mods: [
      { nome: 'KubeJS NeoForge & Rhino', arquivos: ['kubejs-neoforge-2101.7.2-build.381.jar', 'rhino-2101.2.8-build.91.jar'], funcao: 'Scripts JavaScript com recarga via /reload.' },
      { nome: 'KubeJS Create & Mekanism', arquivos: ['kubejs-create-neoforge-2101.3.1-build.18.jar', 'kubejs-mekanism-neoforge-2101.1.7-build.18.jar'], funcao: 'Receitas para a Prensa/Moinho do Create e as Câmaras do Mekanism.' },
      { nome: 'Firma League Core', arquivos: ['zzz-firma-league-core-2.0.0.jar'], funcao: '87 receitas integradas, balanceamento de ginásios e Global Loot Modifiers.' },
      { nome: 'Radical Cobblemon Trainers & RGS', arquivos: ['rctmod-neoforge-1.21.1-0.19.2-beta.jar', 'Radical Gyms  Structures - RGS.jar'], funcao: '+1.500 treinadores, Líderes de Ginásio no mapa, Insígnias e Level Cap.' },
      { nome: 'More Radical Trainers', arquivos: ['more-radical-trainers-1.8.1.jar'], funcao: 'Treinadores extras (Scarlet/Violet) para o Radical Cobblemon Trainers.' },
      { nome: 'FTB Quests, Teams & Library', arquivos: ['ftb-quests-neoforge-2101.1.38.jar', 'ftb-teams-neoforge-2101.1.12.jar', 'ftb-library-neoforge-2101.1.39.jar'], funcao: 'Livro de Quests com 14 capítulos e 140 missões que conduzem a história.' },
      { nome: 'FTB Ultimine', arquivos: ['ftb-ultimine-neoforge-2101.1.15.jar'], funcao: 'Mineração em cadeia com ~ (Grave).' },
    ],
  },
  {
    id: 'qol',
    nome: 'Multiplayer, RP & Qualidade de Vida',
    mods: [
      { nome: 'Essential Mod', arquivos: ['Essential_1-5-2_neoforge_1-21-1.jar'], funcao: 'Multiplayer em 1 clique pela lista de amigos e zoom (C).' },
      { nome: 'Simple Voice Chat', arquivos: ['voicechat-neoforge-1.21.1-2.6.27.jar'], funcao: 'Chat de voz por proximidade, com canais de grupo.' },
      { nome: 'Sound Physics Remastered', arquivos: ['sound-physics-remastered-neoforge-1.21.1-1.5.2.jar'], funcao: 'Reverberação realista em cavernas, ginásios e arenas.' },
      { nome: 'Emotecraft', arquivos: ['emotecraft-for-MC1.21.1-2.4.12-neoforge.jar'], funcao: 'Poses e danças de treinador na tecla B.' },
      { nome: 'Exposure', arquivos: ['exposure-neoforge-1.21.1-1.9.19.jar'], funcao: 'Câmera fotográfica para fotos com a Firma.' },
      { nome: 'Handcrafted & Chipped', arquivos: ['handcrafted-neoforge-1.21.1-4.0.3.jar', 'chipped-neoforge-1.21.1-4.0.2.jar'], funcao: 'Blocos decorativos e móveis para estádios e Centros Pokémon.' },
      { nome: 'Advancement Plaques & Better Advancements', arquivos: ['AdvancementPlaques-1.21.1-neoforge-1.6.8.jar', 'BetterAdvancements-NeoForge-1.21.1-0.4.3.21.jar'], funcao: 'Placas animadas de conquistas e tela de conquistas (L).' },
      { nome: 'Jade & AppleSkin', arquivos: ['Jade-1.21.1-NeoForge-15.10.6.jar', 'appleskin-neoforge-mc1.21-3.0.9.jar'], funcao: 'Informações do bloco em foco e saturação de comida.' },
      { nome: 'Carry On', arquivos: ['carryon-neoforge-1.21.1-2.2.6.13.jar'], funcao: 'Pegue baús, blocos e criaturas no colo e leve para outro lugar.' },
      { nome: 'Traveler’s Backpack', arquivos: ['travelersbackpack-neoforge-1.21.1-10.1.41.jar'], funcao: 'Mochilas temáticas com tanques de fluidos e espaço para ferramentas.' },
      { nome: 'EMI & Just Enough Items', arquivos: ['emi-1.1.24+1.21.1+neoforge.jar', 'jei-1.21.1-neoforge-19.70.0.469.jar'], funcao: 'Consulte receitas e usos de qualquer item, inclusive as receitas da Firma.' },
      { nome: 'Polymorph', arquivos: ['polymorph-neoforge-1.2.0+1.21.1.jar'], funcao: 'Escolha o resultado quando duas receitas usam os mesmos ingredientes.' },
      { nome: 'CobbleFurnies & Pokeblocks', arquivos: ['CobbleFurnies-neoforge-1.2.jar', 'pokeblocks-neoforge-1.5.0-1.21.1.jar'], funcao: 'Móveis, bonecos e blocos decorativos com tema Pokémon.' },
      { nome: 'TrashSlot, Mouse Tweaks & Controlling', arquivos: ['trashslot-neoforge-1.21.1-21.1.11.jar', 'MouseTweaks-neoforge-mc1.21-2.26.1.jar', 'Controlling-neoforge-1.21.1-19.0.5.jar'], funcao: 'Lixeira no inventário, atalhos de mouse para mover itens e busca nas teclas de atalho.' },
    ],
  },
  {
    id: 'performance',
    nome: 'Otimização & Performance',
    mods: [
      { nome: 'Sodium (Embeddium)', arquivos: ['sodium-neoforge-0.8.13+mc1.21.1.jar'], funcao: 'Renderização otimizada: dobra ou triplica o FPS.', lado: 'Cliente' },
      { nome: 'Iris Shaders', arquivos: ['iris-neoforge-1.8.14-beta.1+mc1.21.1.jar'], funcao: 'Suporte a shaders (Complementary Shaders).', lado: 'Cliente' },
      { nome: 'FerriteCore', arquivos: ['ferritecore-7.0.3-neoforge.jar'], funcao: 'Reduz o uso de RAM em até 40%.', lado: 'Ambos' },
      { nome: 'Lithium (ModernFix/Radon)', arquivos: ['lithium-neoforge-0.15.4+mc1.21.1.jar'], funcao: 'Otimiza IA, física e ticks do mundo.', lado: 'Ambos' },
      { nome: 'EntityCulling & ImmediatelyFast', arquivos: ['entityculling-neoforge-1.11.3-mc1.21.1.jar', 'ImmediatelyFast-NeoForge-1.6.15+1.21.1.jar'], funcao: 'Não renderiza entidades atrás de paredes e acelera HUDs.', lado: 'Cliente' },
      { nome: 'Chunky', arquivos: ['Chunky-NeoForge-1.4.23.jar'], funcao: 'Pré-gera chunks para evitar lag ao voar em Pokémon rápidos.', lado: 'Servidor' },
      { nome: 'InControl', arquivos: ['incontrol-1.21-10.3.1.jar'], funcao: 'Regras de spawn de criaturas do servidor.', lado: 'Servidor' },
      { nome: 'Entity Model & Texture Features', arquivos: ['entity_model_features-3.3.12-1.21-neoforge.jar', 'entity_texture_features-7.2.7-1.21-neoforge.jar'], funcao: 'Suporte a modelos e texturas variadas de resource packs.', lado: 'Cliente' },
    ],
  },
  {
    id: 'bibliotecas',
    nome: 'Bibliotecas (necessárias para os outros mods)',
    mods: [
      { nome: 'Architectury, Balm, Athena & Resourceful Lib', arquivos: ['architectury-13.0.11-neoforge.jar', 'balm-neoforge-1.21.1-21.0.67.jar', 'athena-neoforge-1.21.1-4.0.6.jar', 'resourcefullib-neoforge-1.21-3.0.12.jar'], funcao: 'Bases compartilhadas por vários mods multiplataforma.' },
      { nome: 'Cloth Config, YACL & owo-lib', arquivos: ['cloth-config-15.0.140-neoforge.jar', 'yet_another_config_lib_v3-3.8.2+1.21.1-neoforge.jar', 'owo-lib-neoforge-0.12.15.6-beta.1+1.21.jar'], funcao: 'Telas de configuração dos mods.' },
      { nome: 'GeckoLib & Player Animator', arquivos: ['geckolib-neoforge-1.21.1-4.9.3.jar', 'player-animation-lib-forge-2.0.4+1.21.1.jar'], funcao: 'Animações de modelos e do jogador.' },
      { nome: 'Curios API & Accessories', arquivos: ['curios-neoforge-9.5.1+1.21.1.jar', 'accessories-neoforge-1.1.0-beta.54+1.21.1.jar'], funcao: 'Espaços extras para acessórios (anéis, braceletes, mochilas).' },
      { nome: 'Kotlin for Forge', arquivos: ['kotlinforforge-5.12.0-all.jar'], funcao: 'Linguagem usada pelo Cobblemon e addons.' },
      { nome: 'Radical Cobblemon Trainers API, Tim Core & Cobblemore Lib', arquivos: ['rctapi-neoforge-1.21.1-0.16.2-beta.jar', 'timcore-neoforge-1.8.4-1.36.1.jar', 'cobblemore_lib-neoforge-1.2.10.jar'], funcao: 'Bases dos addons de Cobblemon.' },
      { nome: 'Sophisticated Core, Factory API & GuideME', arquivos: ['sophisticatedcore-1.21.1-1.5.28.2458.jar', 'FactoryAPI-1.21.1-2.2.9-neoforge.jar', 'guideme-21.1.22.jar'], funcao: 'Bases das mochilas, da automação e dos guias dentro do jogo.' },
      { nome: 'Lithostitched, Huge Structure Blocks, Iceberg & Searchables', arquivos: ['lithostitched-1.8.1-neoforge-21.1.jar', 'huge-structure-blocks-neoforge-1.1.6.jar', 'Iceberg-1.21.1-neoforge-1.3.2.jar', 'Searchables-neoforge-1.21.1-1.0.2.jar'], funcao: 'Geração de estruturas grandes, tooltips e busca em listas.' },
    ],
  },
];

/** Destaques para a página Jogar: um papel na história para cada. */
export const destaques = [
  { nome: 'Cobblemon 1.8.4', papel: 'O mundo aberto de Pokémon onde a Convergência acontece.' },
  { nome: 'Radical Cobblemon Trainers', papel: 'Os Líderes, a Elite Four e o Level Cap que a Associação impôs.' },
  { nome: 'FTB Quests', papel: 'O livro que conduz os capítulos da história, de Kanto a Sinnoh.' },
  { nome: 'Mega Showdown', papel: 'Mega, Terastal, Z-Moves e Dynamax, os poderes despertados pela fenda.' },
  { nome: 'Powah!', papel: 'O Energizing Orb da Era 2 e os cristais da Master Ball.' },
  { nome: 'Mekanism & Create', papel: 'A engenharia que reconstrói a tecnologia que colapsou.' },
  { nome: 'Sophisticated Backpacks & Storage', papel: 'O armazenamento refeito do zero depois do colapso.' },
  { nome: 'Dungeons and Taverns + Lootr', papel: 'As Masmorras da Convergência, com loot só seu.' },
];

export const faq = [
  {
    p: 'Meu PC é fraco, roda?',
    r: 'O modpack vem com Sodium, FerriteCore, Lithium, EntityCulling e ImmediatelyFast. Reserve de 4 GB a 6 GB de RAM para a instância (-Xmx6G) e deixe os shaders desligados.',
  },
  {
    p: 'Os mods do CurseForge baixam sozinhos?',
    r: 'Sim, no pacote .zip da v2.8.0 eles já vêm dentro: importe o arquivo no CurseForge App ou no Prism Launcher e está pronto. Só na montagem manual antiga (perfil vazio no Modrinth App) era preciso baixar FTB Quests, FTB Teams e FTB Library à parte e colocar os .jar na pasta mods/.',
  },
  { p: 'Como entro no Discord?', r: 'Pelo botão “Comunidade — entre no Discord” no rodapé.' },
  {
    p: 'Já jogo uma versão antiga. Perco meu mundo?',
    r: 'Não. Baixe a Atualização Rápida, extraia dentro da pasta da instância e aceite substituir os arquivos. Mundos, waypoints e binds ficam preservados.',
  },
];
