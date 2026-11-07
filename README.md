# Site da Firma League

Site oficial do modpack **Firma League: Cobblemon, Tech & História** e do servidor da Firma.
React 18 + Vite + TypeScript, React Router, Firebase (Auth Google + Firestore) e PokéAPI.

Desenvolvido por **Fourtech Solutions**.

## Rodar localmente

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/
npm run preview    # serve o build
```

Sem configurar o Firebase, o site funciona normalmente: perfil e times ficam salvos no navegador (localStorage) e o botão de login mostra que o login ainda não está ativo.

## Onde editar cada coisa

| O quê | Arquivo |
| --- | --- |
| IP do servidor, links de download, redes, versão, level caps, nicks dos membros, banidos | `src/config.ts` |
| Ranking e torneios da Liga | `data/liga.json` |
| Dados do modpack por Pokémon (bioma, horário, raridade, estrutura, capítulo, "Disponível no modpack") | `data/modpack-pokemon.json` |
| Times de exemplo da comunidade | `data/times-exemplo.json` |
| Texto da lore (fonte: `HISTORIA_E_RP_FIRMA_LEAGUE.md`) | `src/content/lore.ts` |
| Regulamento (fonte: `REGRAS_LIGA_POKEMON.md`) | `src/content/regras.ts` |
| Lista de mods e FAQ (fonte: `MODLIST_E_INSTALACAO.md`) | `src/content/mods.ts` |
| Logos | `public/assets/logo-firma.svg`, `public/assets/logo-fourtech.svg`, `public/assets/icon-fourtech.svg` |
| Prints do mundo (hero e ranking) | coloque em `public/assets/mundo/` e aponte em `config.imagens` |

Tudo que ainda não foi definido aparece no site com o selo amarelo **[A DEFINIR]**: IP, links de download e redes, data da versão, level caps, spawns do modpack, prints do passo a passo.

`liga.json` tem `"exemplo": true`, que mostra o aviso "Dados de exemplo" no ranking. Troque para `false` quando os dados forem reais. A estrutura já separa jogadores e torneios para virar um painel de admin no futuro (bastaria ler/escrever a mesma forma no Firestore).

## Firebase: criar o projeto e ativar o login Google

1. Acesse <https://console.firebase.google.com> → **Adicionar projeto** (o Google Analytics é opcional).
2. **Authentication** → **Começar** → aba **Método de login** → **Google** → ativar, escolher o e-mail de suporte e salvar.
3. **Authentication** → **Configurações** → **Domínios autorizados**: adicione o domínio da Vercel (ex.: `firma-league.vercel.app`) e o seu domínio próprio, se houver. `localhost` já vem liberado.
4. **Firestore Database** → **Criar banco de dados** → modo de produção → escolha a região (ex.: `southamerica-east1`).
5. **Configurações do projeto** (engrenagem) → **Seus apps** → ícone **Web `</>`** → registre o app (sem Hosting) e copie o objeto `firebaseConfig`.
6. Copie `.env.example` para `.env.local` e preencha:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

7. Publique as regras e o índice do Firestore (precisa do Firebase CLI):

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add            # escolha o projeto
   firebase deploy --only firestore:rules,firestore:indexes
   ```

   Ou cole o conteúdo de `firestore.rules` em **Firestore → Regras** e publique.

### Estrutura no Firestore

```
users/{uid}                    nick, bio, favorito, capitulo, insignias[], perfilPublico   (privado)
users/{uid}/teams/{teamId}     nome, formato, capitulo?, pokemon[], publico, atualizadoEm, autorNick, autorUid
publicProfiles/{nickMinusculo} uid, nick, bio, favorito, capitulo, insignias[]             (leitura pública)
```

Regras (`firestore.rules`): cada usuário só lê e escreve os próprios dados; times com `publico: true` podem ser lidos por todos (link compartilhável `/time/{uid}/{teamId}` e "Times da comunidade"); `publicProfiles` alimenta `/jogador/{nick}`.

Sem login, o navegador guarda o mesmo formato em `localStorage` (`firma:perfil`, `firma:times`). Ao entrar com Google, a página Times oferece **Enviar meus times para a nuvem**.

## Painel da Liga (`/admin`)

Edita ranking e torneios: status, data, campeão, chave de partidas com placar, pontos, vitórias e derrotas (com atalhos "Vitória +3" e "Derrota"). O topo mostra torneios em andamento, partidas sem resultado e o líder.

- **Com Firebase:** os dados ficam no documento `liga/dados` do Firestore e o site inteiro atualiza ao vivo quando um admin publica. Na primeira publicação, o conteúdo de `data/liga.json` é copiado para a nuvem.
- **Sem Firebase:** o painel funciona em modo local (só no seu navegador). Use **Exportar JSON** e substitua `data/liga.json` para publicar.

**Como tornar alguém admin:** a pessoa entra no site com Google uma vez. No console do Firebase → Authentication → Usuários, copie o **UID** dela. Em Firestore → Iniciar coleção `admins` → ID do documento = o UID → qualquer campo (ex.: `nome: "Fulano"`). Depois publique as regras de novo (`firebase deploy --only firestore:rules`).

## Skins

- **Por nick:** cabeça e corpo vêm do mc-heads.net.
- **Por arquivo:** no Perfil, "Enviar arquivo de skin" (.png 64×64 ou 64×32). A cabeça é recortada da textura e o corpo é renderizado em 3D (skinview3d, carregado só quando precisa). A skin enviada fica no perfil (navegador ou nuvem) e aparece no avatar e no perfil público.
- **Membros no site (Home e rodapé):** `config.membros` em `src/config.ts`. Use só o nick ou `{ nick, skin: '/assets/skins/arquivo.png' }` com o arquivo em `public/assets/skins/`.

## Jogadores (`/jogadores`)

Busca pelo nick entre os jogadores do ranking e os perfis públicos (Firestore `publicProfiles`).

## Deploy na Vercel

1. Suba o repositório para o GitHub.
2. Em <https://vercel.com/new>, importe o repositório.
3. **Root Directory**: deixe a raiz do repositório. Framework: Vite (detectado). Build: `npm run build`. Output: `dist`.
4. Em **Environment Variables**, cadastre as seis `VITE_FIREBASE_*`.
5. Deploy. O `vercel.json` já reescreve todas as rotas para `index.html` (React Router).
6. Volte ao Firebase e adicione o domínio da Vercel em **Domínios autorizados** (passo 3 acima).

Pela CLI: `npm i -g vercel`, depois `vercel` e `vercel --prod`.

## Serviços externos

- **PokéAPI** (pokeapi.co): a lista leve (nomes + tipos) é montada uma vez por mês e guardada no IndexedDB; detalhes só quando o Pokémon é aberto, também em cache. Nenhuma página baixa a Pokédex inteira.
- **mc-heads.net**: cabeça e corpo das skins a partir do nick. Nick inexistente cai na skin padrão.
- **api.mcsrvstat.us**: status do servidor, atualizado a cada 60 s (`config.servidor.atualizarCadaSegundos`). Só roda quando `config.servidor.ip` estiver preenchido.

## Estrutura

```
src/
  config.ts            configurações num só lugar
  content/             lore, regras e mods (texto)
  lib/                 PokéAPI + cache, Firebase/armazenamento, tipos, Showdown, validação, análise
  components/          header, rodapé, quest/spoiler, liga, cards, diálogos
  pages/               uma página por rota
  styles/              tokens e CSS por área
data/                  JSON editáveis (liga, modpack, times de exemplo)
```

Rotas: `/`, `/admin`, `/jogadores`, `/lore`, `/pokedex`, `/pokedex/:id`, `/times`, `/times/:teamId`, `/times/comunidade`, `/time/:uid/:teamId`, `/perfil`, `/jogador/:nick`, `/jogar`, `/mods`, `/liga`, `/regulamento`, `/sobre`, `/privacidade`.

## Aviso legal

Projeto de fãs, sem fins lucrativos. Pokémon e seus personagens são marcas da Nintendo, Game Freak, Creatures e The Pokémon Company. Minecraft é marca da Mojang/Microsoft. Não afiliado a esses donos de marca nem à equipe do Cobblemon.
