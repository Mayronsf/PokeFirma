/**
 * POST /api/minecraft/tournament/match-result   (servidor Minecraft → site; header X-Minecraft-Secret)
 * Body: { torneio_id, winner_uuid, loser_uuid, ko_winner, ko_loser, team_winner_dex[], team_loser_dex[], battle_id? }
 *
 * Cada chamada = uma batalha. A lógica (achar a partida, MD1/MD3, ranking, campeão) está em
 * src/lib/torneioAuto.ts. Roda numa transação em liga/dados, então nunca apaga uma edição
 * do painel feita ao mesmo tempo. O site atualiza ao vivo (onSnapshot).
 */
import { ErroResultado, aplicarResultado } from '../../../src/lib/torneioAuto';
import type { LigaData } from '../../../src/lib/ligaTipos';
import { ErroHttp, corpo, db, exigirSegredo, inteiro, listaDex, rota, texto, textoOpc, uuidValido } from '../../_lib/firebase';

export default rota(async (req) => {
  exigirSegredo(req);
  const b = corpo(req);
  const r = {
    torneio_id: texto(b.torneio_id, 'torneio_id', 80),
    winner_uuid: uuidValido(b.winner_uuid, 'winner_uuid'),
    loser_uuid: uuidValido(b.loser_uuid, 'loser_uuid'),
    ko_winner: inteiro(b.ko_winner, 0, 6) ?? 0,
    ko_loser: inteiro(b.ko_loser, 0, 6) ?? 0,
    team_winner_dex: listaDex(b.team_winner_dex),
    team_loser_dex: listaDex(b.team_loser_dex),
    battle_id: textoOpc(b.battle_id, 80),
  };
  const ref = db().doc('liga/dados');
  try {
    return await db().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new ErroHttp(404, 'A Liga ainda não foi salva no painel (/admin).');
      const out = aplicarResultado(snap.data() as LigaData, r);
      if (!out.duplicado) tx.set(ref, JSON.parse(JSON.stringify(out.liga)));
      return {
        duplicado: out.duplicado,
        terminou: out.terminou,
        fase: out.partida.fase,
        placar: out.partida.placar,
        parcial: `${out.placarParcial[0]}–${out.placarParcial[1]}`,
        vencedor_batalha: out.vencedor,
      };
    });
  } catch (e) {
    if (e instanceof ErroResultado) throw new ErroHttp(e.status, e.message);
    throw e;
  }
});
