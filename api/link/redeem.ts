/**
 * POST /api/link/redeem   (site → função; header Authorization: Bearer <Firebase ID token>)
 * Body: { token }
 *
 * Valida o token do /vincular e liga a conta do site ao jogador do Minecraft:
 * - gera o Trainer ID (TR-001, TR-002…) num contador em liga/meta (ou reaproveita o do UUID);
 * - grava nick/trainer_id/minecraft_uuid/verificado em users/{uid} e publicProfiles/{nick};
 * - o nick do Minecraft é a fonte da verdade: se outra conta (não verificada) usava esse nick, perde;
 * - marca uuid/trainer_id nas entradas do ranking e dos torneios que já tinham esse nick.
 * Campos verificados só podem ser escritos aqui (as regras do Firestore bloqueiam o navegador).
 */
import { formatarTrainerId } from '../../src/lib/jogoTipos.js';
import type { LigaData } from '../../src/lib/ligaTipos.js';
import { ErroHttp, corpo, db, exigirUsuario, normalizarToken, rota } from '../_lib/firebase.js';

export default rota(async (req) => {
  const user = await exigirUsuario(req);
  const uid = user.uid;
  const bruto = normalizarToken(corpo(req).token);
  const fs = db();

  // aceita "8K2P" ou "FIRMA-8K2P"
  const candidatos = bruto.startsWith('FIRMA-') ? [bruto] : [bruto, `FIRMA-${bruto}`];
  let tokenRef = fs.doc(`link_tokens/${candidatos[0]}`);
  let snapTok = await tokenRef.get();
  if (!snapTok.exists && candidatos[1]) {
    tokenRef = fs.doc(`link_tokens/${candidatos[1]}`);
    snapTok = await tokenRef.get();
  }
  if (!snapTok.exists) throw new ErroHttp(404, 'Token não encontrado. Digite /vincular no servidor para gerar outro.');

  const resultado = await fs.runTransaction(async (tx) => {
    const tok = await tx.get(tokenRef);
    if (!tok.exists) throw new ErroHttp(404, 'Token já usado. Digite /vincular de novo no servidor.');
    const { minecraft_uuid: uuid, minecraft_nick: nick, expires_at } = tok.data() as { minecraft_uuid: string; minecraft_nick: string; expires_at: number };
    if (Date.now() > expires_at) {
      tx.delete(tokenRef);
      throw new ErroHttp(410, 'Token expirado. Digite /vincular de novo no servidor.');
    }
    const nickKey = nick.toLowerCase();

    const vincRef = fs.doc(`vinculos/${uuid}`);
    const userRef = fs.doc(`users/${uid}`);
    const metaRef = fs.doc('liga/meta');
    const ligaRef = fs.doc('liga/dados');
    const pubRef = fs.doc(`publicProfiles/${nickKey}`);
    const treinRef = fs.doc(`treinadores/${uuid}`);
    const [vinc, usr, meta, liga, pub, trein] = await Promise.all([vincRef, userRef, metaRef, ligaRef, pubRef, treinRef].map((r) => tx.get(r)));

    // essa conta do Minecraft já é de outra conta do site?
    if (vinc.exists && vinc.get('uid') !== uid) {
      const dono = await tx.get(fs.doc(`users/${vinc.get('uid')}`));
      if (dono.exists && dono.get('minecraft_uuid') === uuid) throw new ErroHttp(409, `O jogador ${nick} já está vinculado a outra conta do site.`);
    }
    const u = usr.exists ? usr.data()! : {};
    if (u.verificado && u.minecraft_uuid && u.minecraft_uuid !== uuid)
      throw new ErroHttp(409, `Sua conta já está vinculada ao jogador ${u.nick}. Fale com a organização para trocar.`);

    // Trainer ID: o do UUID (se já teve) ou o próximo do contador
    let trainer_id: string = (vinc.exists && vinc.get('trainer_id')) || (u.minecraft_uuid === uuid && u.trainer_id) || '';
    let proximo: number | null = null;
    if (!trainer_id) {
      const n = (meta.exists ? Number(meta.get('proximoTrainer')) || 1 : 1) as number;
      trainer_id = formatarTrainerId(n);
      proximo = n + 1;
    }

    // perfil público antigo (nick anterior) desta conta: carrega os dados e apaga se o nick mudou
    const antigoKey = typeof u.nick === 'string' && u.nick ? u.nick.toLowerCase() : null;
    let antigo: Record<string, unknown> = {};
    if (antigoKey && antigoKey !== nickKey) {
      const a = await tx.get(fs.doc(`publicProfiles/${antigoKey}`));
      if (a.exists && a.get('uid') === uid) {
        antigo = a.data()!;
        tx.delete(a.ref);
      }
    } else if (pub.exists && pub.get('uid') === uid) {
      antigo = pub.data()!;
    }

    const t = trein.exists ? trein.data()! : {};
    const insignias: string[] = Array.isArray(t.insignias) ? t.insignias : Array.isArray(u.insignias) ? u.insignias : [];
    const capitulo = typeof t.capitulo === 'number' ? t.capitulo : u.capitulo ?? 1;
    const publico = u.perfilPublico !== false;
    const agora = Date.now();

    // ---- daqui para baixo só gravações (o Firestore exige ler tudo antes) ----
    if (proximo !== null) tx.set(metaRef, { proximoTrainer: proximo }, { merge: true });
    tx.set(
      userRef,
      { nick, trainer_id, minecraft_uuid: uuid, verificado: true, vinculadoEm: agora, insignias, capitulo, perfilPublico: publico },
      { merge: true },
    );
    if (publico) {
      tx.set(pubRef, {
        bio: u.bio ?? '',
        favorito: u.favorito ?? null,
        skin: u.skin ?? null,
        timePrincipal: null,
        ...antigo,
        uid,
        nick,
        capitulo,
        insignias,
        trainer_id,
        minecraft_uuid: uuid,
        verificado: true,
      });
    }
    tx.set(vincRef, { uid, nick, trainer_id, vinculadoEm: agora });
    tx.set(treinRef, { uuid, nick, uid, trainer_id, publico, atualizadoEm: t.atualizadoEm ?? 0 }, { merge: true });
    tx.delete(tokenRef);

    // marca o vínculo nas entradas do ranking/torneios que já usavam esse nick
    if (liga.exists) {
      const d = liga.data() as LigaData;
      let mudou = false;
      const marcar = (x: { nick: string; uuid?: string | null; trainer_id?: string | null }) => {
        if (x.nick.toLowerCase() === nickKey && (x.uuid !== uuid || x.trainer_id !== trainer_id)) {
          x.uuid = uuid;
          x.trainer_id = trainer_id;
          x.nick = nick;
          mudou = true;
        }
      };
      d.jogadores.forEach(marcar);
      d.torneios.forEach((tor) => tor.inscritos?.forEach(marcar));
      if (mudou) tx.set(ligaRef, { ...d, rev: (d.rev ?? 0) + 1 });
    }
    return { nick, trainer_id, minecraft_uuid: uuid };
  });

  return resultado;
});
