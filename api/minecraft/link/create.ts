/**
 * POST /api/minecraft/link/create   (servidor Minecraft → site; header X-Minecraft-Secret)
 * Body: { token, minecraft_uuid, minecraft_nick, expires_at }
 * Guarda o token do /vincular em link_tokens/{token}. Ele vale uma vez e até expires_at
 * (se não vier, 15 minutos).
 */
import { ErroHttp, corpo, db, exigirSegredo, inteiro, nickValido, normalizarToken, rota, uuidValido } from '../../_lib/firebase.js';

const MAX_VALIDADE = 60 * 60 * 1000; // no máximo 1 hora

export default rota(async (req) => {
  exigirSegredo(req);
  const b = corpo(req);
  const token = normalizarToken(b.token);
  const uuid = uuidValido(b.minecraft_uuid, 'minecraft_uuid');
  const nick = nickValido(b.minecraft_nick, 'minecraft_nick');
  const agora = Date.now();
  let expira = inteiro(b.expires_at, 0, 1e15) ?? agora + 15 * 60 * 1000;
  if (expira < 1e12) expira *= 1000; // aceita segundos também
  if (expira <= agora) throw new ErroHttp(400, 'expires_at já passou.');
  expira = Math.min(expira, agora + MAX_VALIDADE);

  await db().doc(`link_tokens/${token}`).set({ token, minecraft_uuid: uuid, minecraft_nick: nick, expires_at: expira, criadoEm: agora });
  return { token, expires_at: expira };
});
