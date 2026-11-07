/** Lista de mods — gerada do MODLIST_E_INSTALACAO.md oficial (v2.8.0, NeoForge 1.21.1). Para atualizar, refaça a partir do documento. */

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
    nome: 'Cobblemon & Addons Pokémon (1.8.4 Compatível)',
    mods: [
      {
        nome: 'Cobblemon',
        arquivos: [
          'Cobblemon-neoforge-1.8.4+1.21.1.jar'
        ],
        funcao: 'Mod principal de Pokémon em mundo aberto com 1.025 tabelas de spawn calibradas (padrão Cobbleverse).'
      },
      {
        nome: 'Mega Showdown',
        arquivos: [
          'mega_showdown-neoforge-1.3.3+1.8.4+1.21.1-release.jar'
        ],
        funcao: 'Sistema completo de Mega Evolução, Terastal, Z-Moves, Dynamax e o Omni Ring.'
      },
      {
        nome: 'Z-A Mega',
        arquivos: [
          'zamega-neoforge-1.8.2+1.8.2.jar'
        ],
        funcao: 'Novas Mega Evoluções inspiradas em Legends Z-A (totalizando 83 Mega Stones disponíveis).'
      },
      {
        nome: 'Cobblemon Raid Dens',
        arquivos: [
          'cobblemonraiddens-neoforge-0.13.5+1.21.1.jar'
        ],
        funcao: 'Templos de Raids cooperativas (Tiers 1 a 7) inspiradas em Sword/Shield e Scarlet/Violet.'
      },
      {
        nome: 'MissingMons',
        arquivos: [
          'missingmons-cobblemon-3.6.1.jar'
        ],
        funcao: 'Adiciona mais de uma centena de espécies e modelos Pokémon adicionais ao Cobblemon.'
      },
      {
        nome: 'Legendary Monuments',
        arquivos: [
          'legendarymonuments-neoforge-1.21.1-8.2-Keep-Fighting.jar'
        ],
        funcao: 'Monumentos, templos e altares lendários épicos integrados à campanha das 4 regiões.'
      },
      {
        nome: 'Myths and Legends & Legendary Structures',
        arquivos: [
          'MythsAndLegends-neoforge-1.9.0.jar',
          'cobblemon-legendary-structures-2.2.jar'
        ],
        funcao: 'Invocações e estruturas lendárias clássicas (Sky Pillar, Tera Dens, Santuários).'
      },
      {
        nome: 'Cobblemon Outbreaks',
        arquivos: [
          'cobblemon_outbreaks-neoforge-1.1.2.jar'
        ],
        funcao: 'Surtos massivos (Mass Outbreaks) de espécies Pokémon pelo mundo com chance elevada de Shiny.'
      },
      {
        nome: 'Cobblemon Smartphone',
        arquivos: [
          'cobblemon_smartphone-neoforge-2.0.1.jar'
        ],
        funcao: 'Smartphone portátil com acesso rápido a funções de cura, PC, chamadas e utilidades de treinador.'
      },
      {
        nome: 'CobbleDollars',
        arquivos: [
          'CobbleDollars-neoforge-2.0.0+Beta-6.1+1.21.1.jar'
        ],
        funcao: 'Sistema oficial de moeda Pokémon ($) obtida em batalhas e usada em Poké Marts e lojas.'
      },
      {
        nome: 'SimpleTMs',
        arquivos: [
          'SimpleTMs-neoforge-2.3.3.jar'
        ],
        funcao: 'Máquinas Técnicas (TMs e TRs) completas para ensinar golpes competitivos aos seus Pokémon.'
      },
      {
        nome: 'Cobbleworkers',
        arquivos: [
          'cobbleworkers-neoforge-2.0.7+1.8.3.jar'
        ],
        funcao: 'Seus Pokémon no Pasture Block trabalham na base (colhendo plantações, minerando, gerando recursos).'
      },
      {
        nome: 'Pasture Loot & Safe Pastures',
        arquivos: [
          'PastureLoot-neoforge-2.0.0+1.21.1.jar',
          'SafePastures(Neoforge)-1.1.2+1.21.1.jar'
        ],
        funcao: 'Pokémon no pasto soltam drops orgânicos e ficam 100% protegidos contra dano/acidentes.'
      },
      {
        nome: 'Cobbreeding',
        arquivos: [
          'Cobbreeding-neoforge-2.4.1.jar'
        ],
        funcao: 'Sistema completo de cruzamento e ovos no Pasture Block (herança de IVs, Natures e Egg Moves).'
      },
      {
        nome: 'Cobblemon Utility+ & Only Bottle Caps',
        arquivos: [
          'Cobblemon-Utility+-neoforge-1.8.0.jar',
          'Only Bottle Caps-1.5.0-neoforge.jar'
        ],
        funcao: 'Silver e Golden Bottle Caps (Hyper Training de IVs 31) e penas/itens de ajuste fino de EVs e Natures.'
      },
      {
        nome: 'Pokeblocks',
        arquivos: [
          'pokeblocks-neoforge-1.5.0-1.21.1.jar'
        ],
        funcao: 'Preparação de Pokéblocks e guloseimas com Berries para atrair Pokémon raros e aprimorar atributos.'
      },
      {
        nome: 'Cobblemon Size Variation',
        arquivos: [
          'CobblemonSizeVariationNeoforge-1.4.0+1.7.0.jar'
        ],
        funcao: 'Variação visual real de tamanho (de minúsculos XXS a gigantes XXL / Alphas) em todos os Pokémon.'
      },
      {
        nome: 'Badge Box & Pokemon Badges',
        arquivos: [
          'badgebox-neoforge-1.3.0.jar',
          'cobblemonpokemonbadges-neoforge-0.1.1.jar'
        ],
        funcao: 'Estojo físico colecionável de Insígnias para exibir suas conquistas das 4 regiões no inventário e na base.'
      },
      {
        nome: 'Catch Indicator & Catch Rate Display',
        arquivos: [
          'catchindicator-neoforge-3.0.jar',
          'catchrate-display-neoforge-2.12.3.jar'
        ],
        funcao: 'Indicador visual de espécies já capturadas na Pokédex e exibição da porcentagem exata de captura de cada Pokébola.'
      },
      {
        nome: 'Cobblemon Battle Extras',
        arquivos: [
          'cobblemon-battle-extras-neoforge-1.13.45.jar'
        ],
        funcao: 'HUD estilo Pokémon Showdown: turnos de clima, terreno, Trick Room, hazards e modificadores de stats.'
      },
      {
        nome: 'Cobblemon Effectiveness',
        arquivos: [
          'cobeffectiveness-neoforge-0.4.0-beta.1.jar'
        ],
        funcao: 'Destaca nos botões de ataque quais golpes são Super Efetivos (2x, 4x), Neutros ou Imunes contra o alvo.'
      },
      {
        nome: 'MoreCobblemonTweaks',
        arquivos: [
          'MoreCobblemonTweaks-neoforge-1.3.6.jar'
        ],
        funcao: 'Melhorias de interface no PC Pokémon (busca avançada, filtros por IV/Shiny/Tipo e organização de boxes).'
      },
      {
        nome: 'Cobblemon Spawn Notification',
        arquivos: [
          'spawnnotification-neoforge-1.8.4-2.3.0.jar'
        ],
        funcao: 'Notifica no chat e toca som exclusivo quando Shinies, Lendários ou Alphas aparecem perto de você.'
      },
      {
        nome: 'Cobblemon PokéNav',
        arquivos: [
          'cobblenav-neoforge-2.4.2.jar'
        ],
        funcao: 'Radar de bolso que mostra quais Pokémon spawnam no bioma atual e suas probabilidades.'
      },
      {
        nome: 'Cobblemon Box Link',
        arquivos: [
          'cobblemonboxlink-neoforge-1.21.1-1.0.6.jar'
        ],
        funcao: 'Acesso portátil ao seu PC de Pokémon em qualquer lugar do mapa.'
      },
      {
        nome: 'Cobblemon Wiki GUI',
        arquivos: [
          'CobblemonWikiGui-neoforge-2.7.1+1.21.1.jar'
        ],
        funcao: 'Digite /pwiki para consultar evoluções, drops, biomas de spawn e base stats dentro do jogo.'
      },
      {
        nome: 'Cobblemon Integrations',
        arquivos: [
          'cobblemonintegrations-neoforge-1.21.1-1.1.8.jar'
        ],
        funcao: 'Integração perfeita com Jade (status ao olhar para o Pokémon), JEI e minimapas (Xaero’s).'
      },
      {
        nome: 'Player XP & Capture XP',
        arquivos: [
          'playerxp-neoforge-1.1.2+1.21.1.jar',
          'capturexp-neoforge-1.8.4-1.3.0.jar'
        ],
        funcao: 'Batalhas e capturas Pokémon concedem experiência de jogador no Minecraft.'
      },
      {
        nome: 'Fight or Flight',
        arquivos: [
          'fightorflight-neoforge-0.11.1.jar'
        ],
        funcao: 'Pokémon selvagens agressivos podem revidar e atacar no mundo aberto.'
      },
      {
        nome: 'Release Rewards, Unchained & Counter',
        arquivos: [
          'releaserewards-neoforge-3.0.4.jar',
          'unchained-neoforge-1.8.4-1.7.4.jar',
          'counter-neoforge-1.8.4-1.9.4.jar'
        ],
        funcao: 'Recompensas ao soltar Pokémon do PC; bônus de IV/Shiny em cadeias de captura (Catch Combo) e contador na HUD.'
      },
      {
        nome: 'CobbleFurnies',
        arquivos: [
          'CobbleFurnies-neoforge-1.2.jar'
        ],
        funcao: 'Mobiliário temático oficial do universo Pokémon (sofás, mesas, luminárias, armários e decorações de Centro Pokémon).'
      }
    ]
  },
  {
    id: 'masmorras',
    nome: 'Masmorras, Exploração, Mapas & Combate',
    mods: [
      {
        nome: 'Dungeons and Taverns',
        arquivos: [
          'dungeons-and-taverns-v4.4.4.jar'
        ],
        funcao: 'Grandes masmorras, criptas, tavernas e fortalezas subterrâneas com salas de tesouro secretas.'
      },
      {
        nome: 'Repurposed Structures',
        arquivos: [
          'repurposed_structures-7.5.22+1.21.1-neoforge.jar'
        ],
        funcao: 'Variantes temáticas de templos, vilas, fortalezas, mansões e ruínas adaptadas a cada bioma.'
      },
      {
        nome: 'Artifacts',
        arquivos: [
          'artifacts-neoforge-13.2.5.jar'
        ],
        funcao: 'Relíquias passivas místicas em acampamentos (Everlasting Beef, Bunny Hoppers, Cloud in a Bottle).'
      },
      {
        nome: 'Simply Swords',
        arquivos: [
          'simplyswords-neoforge-1.70.2-1.21.1.jar'
        ],
        funcao: 'Armas temáticas (Claymores, Chakrams, Twinblades, Foices) com habilidades únicas e a Forja Rúnica.'
      },
      {
        nome: 'Simply Tooltips & Fzzy Config',
        arquivos: [
          'SimplyTooltips-neoforge-0.1.5.jar',
          'fzzy_config-0.7.7+fix1+1.21+neoforge.jar'
        ],
        funcao: 'Tooltips estilizadas e sistema de configuração do Simply Swords.'
      },
      {
        nome: 'Target Dummy (MmmMmmMmmMmm)',
        arquivos: [
          'dummmmmmy-1.21-2.1.2-neoforge.jar'
        ],
        funcao: 'Boneco de treino: recebe armaduras, exibe números flutuantes de dano e mede o DPS de golpes.'
      },
      {
        nome: 'Xaero’s Minimap & World Map',
        arquivos: [
          'xaerominimap-neoforge-1.21.1-26.6.0.jar',
          'xaeroworldmap-neoforge-1.21.1-1.47.0.jar'
        ],
        funcao: 'Minimapa no canto da tela e Mapa-Múndi em tela cheia (M) com ícones de Pokémon, Waypoints e Ginásios.'
      },
      {
        nome: 'Explorer’s & Nature’s Compass',
        arquivos: [
          'ExplorersCompass-1.21.1-3.4.0-neoforge.jar',
          'NaturesCompass-1.21.1-3.4.0-neoforge.jar'
        ],
        funcao: 'Bússolas de navegação para localizar estruturas (Ginásios, Dungeons, Santuários) e biomas específicos.'
      },
      {
        nome: 'Waystones',
        arquivos: [
          'waystones-neoforge-1.21.1-21.1.46.jar'
        ],
        funcao: 'Sistema de teleporte rápido entre bases, vilas Cobbleverse, ginásios e arenas.'
      },
      {
        nome: 'Lootr',
        arquivos: [
          'lootr-neoforge-1.21.1-1.11.38.127.jar'
        ],
        funcao: 'Cada jogador tem o seu próprio loot individual em baús de masmorras e estruturas (ninguém rouba baú alheio).'
      },
      {
        nome: 'Sparse Structures',
        arquivos: [
          'sparsestructures-neoforge-1.21.1-3.0.jar'
        ],
        funcao: 'Anti-colisão de estruturas: espaça as masmorras para não esmagarem nem quebrarem as Vilas BCA e Ginásios.'
      }
    ]
  },
  {
    id: 'tech',
    nome: 'Engenharia Tech, Automação & Logística',
    mods: [
      {
        nome: 'Create',
        arquivos: [
          'create-1.21.1-6.0.10.jar'
        ],
        funcao: 'Engenharia cinética (engrenagens, esteiras, prensas mecânicas, moinhos) para fabricar Pokébolas.'
      },
      {
        nome: 'Create Crafts & Additions',
        arquivos: [
          'createaddition-1.7.2.jar'
        ],
        funcao: 'Conecta a energia rotacional do Create com a rede de eletricidade RF/FE do Mekanism e Powah.'
      },
      {
        nome: 'Mekanism',
        arquivos: [
          'Mekanism-1.21.1-10.7.19.85.jar'
        ],
        funcao: 'Processamento químico, refino de metais (Aço, Ósmio), infusões e Circuitos de Controle.'
      },
      {
        nome: 'Mekanism Generators & Tools',
        arquivos: [
          'MekanismGenerators-1.21.1-10.7.19.85.jar',
          'MekanismTools-1.21.1-10.7.19.85.jar'
        ],
        funcao: 'Reatores, geradores solares/eólicos e ferramentas industriais avançadas (Paxel).'
      },
      {
        nome: 'Powah!',
        arquivos: [
          'Powah-6.2.10.jar'
        ],
        funcao: 'Energizing Orb, Aço Energizado, Cristais (Blazing, Niotic, Spirited, Nitro) para itens de elite.'
      },
      {
        nome: 'Applied Energistics 2 (AE2)',
        arquivos: [
          'appliedenergistics2-19.2.18.jar'
        ],
        funcao: 'Armazenamento digital quântico em discos ME e automação computadorizada.'
      },
      {
        nome: 'Industrial Foregoing & Titanium',
        arquivos: [
          'industrialforegoing-1.21-3.6.39.jar',
          'titanium-1.21-4.0.52.jar'
        ],
        funcao: 'Extratores industriais de fluidos, lasers de mineração e automação rural.'
      },
      {
        nome: 'Tom’s Simple Storage',
        arquivos: [
          'toms_storage-1.21-2.4.2.jar'
        ],
        funcao: 'Terminal de inventário unificado com barra de busca e acesso wireless a todos os seus baús no início do jogo.'
      },
      {
        nome: 'Better Furnaces Reforged',
        arquivos: [
          'BetterFurnacesReforged-1.21.1-1.1.2518.1-neoforge.jar'
        ],
        funcao: 'Fornalhas de Cobre, Ferro, Ouro, Diamante e Netherite de altíssima velocidade e eficiência.'
      },
      {
        nome: 'Sophisticated Backpacks & Storage',
        arquivos: [
          'sophisticatedbackpacks-1.21.1-3.26.20.2244.jar',
          'sophisticatedstorage-1.21.1-1.6.16.2222.jar'
        ],
        funcao: 'Mochilas e baús em níveis de minério com upgrades de ímã, auto-alimentação, compactação e filtros.'
      },
      {
        nome: 'Traveler’s Backpack',
        arquivos: [
          'travelersbackpack-neoforge-1.21.1-10.1.41.jar'
        ],
        funcao: 'Mochilas temáticas de aventureiro com tanques de fluidos integrados, saco de dormir e bancada portátil.'
      },
      {
        nome: 'Carry On',
        arquivos: [
          'carryon-neoforge-1.21.1-2.2.6.13.jar'
        ],
        funcao: 'Pegue e carregue baús cheios, máquinas e pequenos animais no colo (Shift + Clique Direito com as mãos vazias).'
      }
    ]
  },
  {
    id: 'kubejs',
    nome: 'KubeJS, Receitas Integradas, Liga & Sincronização Web',
    mods: [
      {
        nome: 'KubeJS NeoForge & Rhino',
        arquivos: [
          'kubejs-neoforge-2101.7.2-build.381.jar',
          'rhino-2101.2.8-build.91.jar'
        ],
        funcao: 'Motor de scripts JavaScript responsável pelas receitas customizadas, progressão de Level Cap e Ponte Web em Tempo Real (poke-firma.vercel.app).'
      },
      {
        nome: 'KubeJS Create & Mekanism',
        arquivos: [
          'kubejs-create-neoforge-2101.3.1-build.18.jar',
          'kubejs-mekanism-neoforge-2101.1.7-build.18.jar'
        ],
        funcao: 'Integração nativa de receitas para Prensa/Moinho do Create e Câmaras do Mekanism.'
      },
      {
        nome: 'Firma League Core',
        arquivos: [
          'zzz-firma-league-core-2.0.0.jar'
        ],
        funcao: 'Mod core da Firma contendo 87 receitas integradas, Global Loot Modifiers e permissões de rede do KubeJS.'
      },
      {
        nome: 'Radical Cobblemon Trainers, RGS & More Radical Trainers',
        arquivos: [
          'rctmod-neoforge-1.21.1-0.19.2-beta.jar',
          'rctapi-neoforge-1.21.1-0.16.2-beta.jar',
          'Radical Gyms  Structures - RGS.jar',
          'more-radical-trainers-1.8.1.jar'
        ],
        funcao: '+1.500 treinadores, Líderes de Ginásio de Kanto/Johto/Hoenn/Sinnoh, Insígnias e Level Cap progressivo (15 → 60 → 75 → 90 → 100).'
      },
      {
        nome: 'FTB Quests, Teams & Library',
        arquivos: [
          'ftb-quests-neoforge-2101.1.38.jar',
          'ftb-teams-neoforge-2101.1.12.jar',
          'ftb-library-neoforge-2101.1.39.jar'
        ],
        funcao: 'Livro de Quests com 14 capítulos e 140 missões conduzindo a história e as regras da Liga.'
      },
      {
        nome: 'FTB Ultimine',
        arquivos: [
          'ftb-ultimine-neoforge-2101.1.15.jar'
        ],
        funcao: 'Mineração em cadeia com a tecla de atalho (~ / Grave) para economizar tempo na rotina CLT.'
      },
      {
        nome: 'InControl',
        arquivos: [
          'incontrol-1.21-10.3.1.jar'
        ],
        funcao: 'Controle avançado de regras de spawn de criaturas hostis e proteção de áreas da Liga.'
      }
    ]
  },
  {
    id: 'qol',
    nome: 'Multiplayer Fácil, RP & Qualidade de Vida (QoL)',
    mods: [
      {
        nome: 'Essential Mod',
        arquivos: [
          'Essential_1-5-2_neoforge_1-21-1.jar'
        ],
        funcao: 'Multiplayer e Social: lista de amigos, cosméticos, screenshots e zoom embutido (C).'
      },
      {
        nome: 'Simple Voice Chat',
        arquivos: [
          'voicechat-neoforge-1.21.1-2.6.27.jar'
        ],
        funcao: 'Chat de voz por proximidade espacial 3D dentro do jogo com suporte a grupos de rádio.'
      },
      {
        nome: 'Sound Physics Remastered',
        arquivos: [
          'sound-physics-remastered-neoforge-1.21.1-1.5.2.jar'
        ],
        funcao: 'Reverberação e acústica realista em cavernas, ginásios e estádios da Liga.'
      },
      {
        nome: 'Emotecraft',
        arquivos: [
          'emotecraft-for-MC1.21.1-2.4.12-neoforge.jar'
        ],
        funcao: 'Poses de comemoração de treinador e danças customizadas com a tecla B.'
      },
      {
        nome: 'Exposure',
        arquivos: [
          'exposure-neoforge-1.21.1-1.9.19.jar'
        ],
        funcao: 'Câmera fotográfica funcional para tirar fotos com amigos e emoldurar na parede da base.'
      },
      {
        nome: 'Handcrafted & Chipped',
        arquivos: [
          'handcrafted-neoforge-1.21.1-4.0.3.jar',
          'chipped-neoforge-1.21.1-4.0.2.jar'
        ],
        funcao: 'Centenas de blocos decorativos e móveis para construir estádios da Liga e Centros Pokémon.'
      },
      {
        nome: 'JEI, EMI, Polymorph & GuideME',
        arquivos: [
          'jei-1.21.1-neoforge-19.70.0.469.jar',
          'emi-1.1.24+1.21.1+neoforge.jar',
          'polymorph-neoforge-1.2.0+1.21.1.jar',
          'guideme-21.1.22.jar'
        ],
        funcao: 'Catálogo visual de todas as receitas (incluindo Create/Mekanism/Powah), árvore de crafting e resolução de conflitos.'
      },
      {
        nome: 'Controlling, Searchables, Mouse Tweaks & TrashSlot',
        arquivos: [
          'Controlling-neoforge-1.21.1-19.0.5.jar',
          'Searchables-neoforge-1.21.1-1.0.2.jar',
          'MouseTweaks-neoforge-mc1.21-2.26.1.jar',
          'trashslot-neoforge-1.21.1-21.1.11.jar'
        ],
        funcao: 'Busca inteligente de teclas de atalho, arraste rápido de itens com o mouse e lixeira integrada no inventário.'
      },
      {
        nome: 'Advancement Plaques & Better Advancements',
        arquivos: [
          'AdvancementPlaques-1.21.1-neoforge-1.6.8.jar',
          'BetterAdvancements-NeoForge-1.21.1-0.4.3.21.jar'
        ],
        funcao: 'Placas animadas de conquistas no estilo Cobbleverse e tela de conquistas expandida (L).'
      },
      {
        nome: 'Jade & AppleSkin',
        arquivos: [
          'Jade-1.21.1-NeoForge-15.10.6.jar',
          'appleskin-neoforge-mc1.21-3.0.9.jar'
        ],
        funcao: 'Mostra informações do bloco/Pokémon em foco e saturação de alimentos na barra de fome.'
      }
    ]
  },
  {
    id: 'performance',
    nome: 'Otimização, Performance & Bibliotecas Base',
    mods: [
      {
        nome: 'Sodium',
        arquivos: [
          'sodium-neoforge-0.8.13+mc1.21.1.jar'
        ],
        funcao: 'Motor moderno de renderização por GPU (duplica ou triplica o FPS).',
        lado: 'Cliente'
      },
      {
        nome: 'Iris Shaders',
        arquivos: [
          'iris-neoforge-1.8.14-beta.1+mc1.21.1.jar'
        ],
        funcao: 'Suporte completo a pacotes de shaders (Complementary Shaders).',
        lado: 'Cliente'
      },
      {
        nome: 'Entity Model & Texture Features (EMF/ETF)',
        arquivos: [
          'entity_model_features-3.3.12-1.21-neoforge.jar',
          'entity_texture_features-7.2.7-1.21-neoforge.jar'
        ],
        funcao: 'Suporte a modelos e texturas animadas de resource packs (OptiFine CEM/CIT).',
        lado: 'Cliente'
      },
      {
        nome: 'FerriteCore',
        arquivos: [
          'ferritecore-7.0.3-neoforge.jar'
        ],
        funcao: 'Reduz drasticamente o uso de memória RAM em até 40%.',
        lado: 'Ambos'
      },
      {
        nome: 'Lithium',
        arquivos: [
          'lithium-neoforge-0.15.4+mc1.21.1.jar'
        ],
        funcao: 'Otimização profunda de inteligência artificial, física e ticks do servidor.',
        lado: 'Ambos'
      },
      {
        nome: 'EntityCulling & ImmediatelyFast',
        arquivos: [
          'entityculling-neoforge-1.11.3-mc1.21.1.jar',
          'ImmediatelyFast-NeoForge-1.6.15+1.21.1.jar'
        ],
        funcao: 'Não renderiza entidades escondidas atrás de paredes e acelera a renderização de HUDs e entidades.',
        lado: 'Cliente'
      },
      {
        nome: 'Chunky',
        arquivos: [
          'Chunky-NeoForge-1.4.23.jar'
        ],
        funcao: 'Pré-geração de chunks para impedir travamentos quando jogadores voam em Pokémon rápidos.',
        lado: 'Servidor'
      },
      {
        nome: 'Bibliotecas & APIs de Suporte',
        arquivos: [
          'architectury-13.0.11-neoforge.jar',
          'athena-neoforge-1.21.1-4.0.6.jar',
          'balm-neoforge-1.21.1-21.0.67.jar',
          'cloth-config-15.0.140-neoforge.jar',
          'cobblemore_lib-neoforge-1.2.10.jar',
          'curios-neoforge-9.5.1+1.21.1.jar',
          'accessories-neoforge-1.1.0-beta.54+1.21.1.jar',
          'FactoryAPI-1.21.1-2.2.9-neoforge.jar',
          'geckolib-neoforge-1.21.1-4.9.3.jar',
          'huge-structure-blocks-neoforge-1.1.6.jar',
          'Iceberg-1.21.1-neoforge-1.3.2.jar',
          'kotlinforforge-5.12.0-all.jar',
          'lithostitched-1.8.1-neoforge-21.1.jar',
          'moonlight-1.21.1-3.8.2-neoforge.jar',
          'owo-lib-neoforge-0.12.15.6-beta.1+1.21.jar',
          'player-animation-lib-forge-2.0.4+1.21.1.jar',
          'resourcefullib-neoforge-1.21-3.0.12.jar',
          'sophisticatedcore-1.21.1-1.5.28.2458.jar',
          'timcore-neoforge-1.8.4-1.36.1.jar',
          'yet_another_config_lib_v3-3.8.2+1.21.1-neoforge.jar'
        ],
        funcao: 'Bibliotecas essenciais para animações 3D, slots de acessórios (Mega Bracelet/Omni Ring), estruturas gigantes e geração de mundo.',
        lado: 'Ambos'
      }
    ]
  }
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
