/**
 * POST /api/minecraft/sync/player   (servidor Minecraft → site; header X-Minecraft-Secret)
 * Body: { uuid, nick, capitulo, level_cap, insignias, pokedex, party, pc? }
 *   party: até 6 Pokémon; pc: Pokémon do PC (opcional, com "caixa" e "slot").
 *   Campos de cada Pokémon: dex, especie, forma, apelido, nivel, shiny, sexo ("M"/"F"), habilidade,
 *   natureza, item, golpes[], ivs{}, evs{}, tera, bola, amizade.
 *
 * Grava tudo em treinadores/{uuid} (o site escuta ao vivo). Se o jogador já vinculou a conta no site,
 * também atualiza insígnias e capítulo em users/{uid} e publicProfiles/{nick}.
 * Campos que não vierem no corpo ficam como estavam (dá para mandar só a party, por exemplo).
 */
import { limparInsignias, limparMon, limparPokedex, type MonJogo } from '../../../src/lib/jogoTipos';
import { corpo, db, exigirSegredo, inteiro, nickValido, rota, uuidValido } from '../../_lib/firebase';

const MAX_PC = 1200;

export default rota(async (req) => {
  exigirSegredo(req);
  const b = corpo(req);
  const uuid = uuidValido(b.uuid, 'uuid');
  const nick = nickValido(b.nick);
  const fs = db();

  const dados: Record<string, unknown> = { uuid, nick, atualizadoEm: Date.now() };
  if ('capitulo' in b) dados.capitulo = inteiro(b.capitulo, 1, 4);
  if ('level_cap' in b) dados.level_cap = inteiro(b.level_cap, 1, 100);
  if ('insignias' in b) dados.insignias = limparInsignias(b.insignias);
  if ('pokedex' in b) dados.pokedex = limparPokedex(b.pokedex);
  if ('party' in b) dados.party = (Array.isArray(b.party) ? b.party : []).map(limparMon).filter((m): m is MonJogo => !!m).slice(0, 6);
  if ('pc' in b) dados.pc = (Array.isArray(b.pc) ? b.pc : []).map(limparMon).filter((m): m is MonJogo => !!m).slice(0, MAX_PC);

  const vinc = await fs.doc(`vinculos/${uuid}`).get();
  const uid: string | null = vinc.exists ? vinc.get('uid') : null;
  const trainer_id: string | null = vinc.exists ? vinc.get('trainer_id') ?? null : null;

  let publico = true;
  if (uid) {
    const usr = await fs.doc(`users/${uid}`).get();
    if (usr.exists && usr.get('minecraft_uuid') === uuid) {
      publico = usr.get('perfilPublico') !== false;
      const patch: Record<string, unknown> = {};
      if ('insignias' in dados) patch.insignias = dados.insignias;
      if (dados.capitulo) patch.capitulo = dados.capitulo;
      if (dados.level_cap) patch.level_cap = dados.level_cap;
      if (dados.pokedex) {
        const p = dados.pokedex as { total_vistos: number; total_capturados: number };
        patch.pokedexResumo = { vistos: p.total_vistos, capturados: p.total_capturados };
      }
      // nick trocado no Minecraft (Mojang permite): segue o novo
      const nickAntigo = String(usr.get('nick') ?? '');
      if (nickAntigo && nickAntigo !== nick) patch.nick = nick;
      {
        await fs.doc(`users/${uid}`).set(patch, { merge: true });
        // perfil público recriado pelo navegador perde os campos de verificação: o servidor devolve
        const pubPatch = { ...patch, trainer_id, minecraft_uuid: uuid, verificado: true };
        if (publico) {
          const novoRef = fs.doc(`publicProfiles/${nick.toLowerCase()}`);
          if (nickAntigo && nickAntigo.toLowerCase() !== nick.toLowerCase()) {
            const velho = await fs.doc(`publicProfiles/${nickAntigo.toLowerCase()}`).get();
            if (velho.exists && velho.get('uid') === uid) {
              await novoRef.set({ ...velho.data(), ...pubPatch, nick });
              await velho.ref.delete();
            }
          } else {
            const pub = await novoRef.get();
            if (pub.exists && pub.get('uid') === uid) await novoRef.set(pubPatch, { merge: true });
          }
        }
        if (patch.nick) await fs.doc(`vinculos/${uuid}`).set({ nick }, { merge: true });
      }
    }
  }

  await fs.doc(`treinadores/${uuid}`).set({ ...dados, uid, trainer_id, publico }, { merge: true });
  return { vinculado: !!uid, trainer_id };
});
