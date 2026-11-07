import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BadgeCheck, Search, X } from 'lucide-react';
import { Consult } from '../components/Shell';
import { SkinHead } from '../components/ui';
import { firebaseEnabled } from '../lib/firebase';
import { useLiga } from '../lib/liga';
import { buscarPerfis, type PublicProfile } from '../lib/store';
import '../styles/dex.css';
import '../styles/pages.css';

interface Resultado {
  nick: string;
  skinNick: string;
  skin?: string;
  pos?: number;
  pontos?: number;
  bio?: string;
  temPerfil: boolean;
  trainer_id?: string;
}

export default function Jogadores() {
  const [sp, setSp] = useSearchParams();
  const q = sp.get('q') ?? '';
  const { ranking } = useLiga();
  const [perfis, setPerfis] = useState<PublicProfile[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!firebaseEnabled) return;
    let alive = true;
    setCarregando(true);
    const t = setTimeout(() => {
      buscarPerfis(q)
        .then((r) => alive && (setPerfis(r), setErro(false)))
        .catch(() => alive && setErro(true))
        .finally(() => alive && setCarregando(false));
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q]);

  const resultados = useMemo<Resultado[]>(() => {
    const term = q.trim().toLowerCase();
    const map = new Map<string, Resultado>();
    ranking.forEach((j, i) => {
      if (term && !j.nick.toLowerCase().includes(term)) return;
      map.set(j.nick.toLowerCase(), { nick: j.nick, skinNick: j.skin || j.nick, pos: i + 1, pontos: j.pontos, temPerfil: false, trainer_id: j.trainer_id ?? undefined });
    });
    for (const p of perfis) {
      const k = p.nick.toLowerCase();
      const cur = map.get(k);
      map.set(k, { ...(cur ?? { nick: p.nick, skinNick: p.nick }), skin: p.skin || undefined, bio: p.bio, temPerfil: true, trainer_id: (p.verificado && p.trainer_id) || cur?.trainer_id });
    }
    return [...map.values()].sort((a, b) => (a.pos ?? 999) - (b.pos ?? 999) || a.nick.localeCompare(b.nick));
  }, [ranking, perfis, q]);

  return (
    <Consult
      title={
        <>
          Jogadores <span className="serif-i">da Firma</span>
        </>
      }
      intro="Procure um treinador pelo nick para ver o perfil, as insígnias, os títulos e os times públicos."
    >
      <main id="conteudo" className="players">
        <label className="dex-search players-search">
          <Search size={18} aria-hidden />
          <span className="sr-only">Buscar jogador pelo nick</span>
          <input
            type="search"
            value={q}
            placeholder="Nick do Minecraft"
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setSp(e.target.value ? { q: e.target.value } : {}, { replace: true })}
          />
          {q && (
            <button type="button" aria-label="Limpar busca" onClick={() => setSp({}, { replace: true })}>
              <X size={16} aria-hidden />
            </button>
          )}
        </label>
        {!firebaseEnabled && <p className="muted small">Por enquanto a busca cobre só os jogadores do ranking da Liga. Perfis públicos entram quando o login for configurado.</p>}
        {erro && <p className="muted small">Não consegui buscar os perfis públicos agora. Mostrando só o ranking.</p>}

        <p className="dex-count" role="status">
          <span className="pixel tabular">{resultados.length}</span> {resultados.length === 1 ? 'jogador' : 'jogadores'}
          {carregando && <span className="muted"> · buscando…</span>}
        </p>
        {resultados.length ? (
          <ul className="player-grid">
            {resultados.map((r) => (
              <li key={r.nick}>
                <Link to={`/jogador/${encodeURIComponent(r.nick)}`} className="player-card">
                  <SkinHead nick={r.skinNick} skin={r.skin} size={48} />
                  <span className="player-main">
                    <b>
                      {r.nick}
                      {r.trainer_id && (
                        <span className="player-tid" title="Conta verificada no servidor">
                          <BadgeCheck size={13} aria-hidden /> {r.trainer_id}
                        </span>
                      )}
                    </b>
                    <span className="muted small">{r.bio || (r.temPerfil ? 'Perfil público' : 'Jogador da Liga')}</span>
                  </span>
                  {r.pos && (
                    <span className="player-rank">
                      <span className="pixel tabular">{r.pos}º</span>
                      <span className="small muted">
                        <span className="pixel tabular">{r.pontos}</span> pts
                      </span>
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="state-box">
            <p>
              {q ? (
                <>
                  <b>Ninguém com “{q}”.</b> O perfil pode estar privado ou o nick estar escrito diferente.
                </>
              ) : carregando ? (
                'Buscando jogadores…'
              ) : (
                <>
                  <b>Ainda não há jogadores com perfil público.</b> Entre com Google e preencha seu nick em Perfil para aparecer aqui.
                </>
              )}
            </p>
          </div>
        )}
      </main>
    </Consult>
  );
}
