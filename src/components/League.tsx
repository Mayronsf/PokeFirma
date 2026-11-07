import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Crown } from 'lucide-react';
import { useLiga, type Torneio } from '../lib/liga';
import { fmtData } from '../lib/pt';
import { CountUp } from './Motion';
import { TorneioDetalhe } from './TorneioDetalhe';
import { SkinHead, Tbd } from './ui';

export function ExemploFlag() {
  const { data } = useLiga();
  if (!data.exemplo) return null;
  return <span className="exemplo-flag">Dados de exemplo</span>;
}

export function Podium() {
  const { ranking } = useLiga();
  const top = ranking.slice(0, 3);
  const order = [top[1], top[0], top[2]].filter(Boolean);
  if (!ranking.length)
    return (
      <div className="rank-empty">
        <p>
          <b>O ranking começa na primeira Copa.</b>
        </p>
        <p>Os pontos aparecem aqui assim que a organização registrar os primeiros resultados.</p>
      </div>
    );
  return (
    <ol className="podium" aria-label="Três primeiros do ranking">
      {order.map((j) => {
        const pos = ranking.indexOf(j) + 1;
        return (
          <li key={j.nick} className={`podium-card p${pos}`} value={pos}>
            {pos === 1 && <Crown className="podium-crown" size={30} aria-label="Líder" />}
            <SkinHead nick={j.skin ?? j.nick} size={pos === 1 ? 72 : 60} className="podium-head" />
            <Link to={`/jogador/${encodeURIComponent(j.nick)}`} className="podium-nick">
              {j.nick}
            </Link>
            <span className="podium-label">Pontos</span>
            <span className="podium-pts pixel tabular">
              <CountUp value={j.pontos} />
            </span>
            <span className="podium-num display" aria-hidden="true">
              {pos}
            </span>
            <span className="sr-only">{pos}º lugar</span>
          </li>
        );
      })}
    </ol>
  );
}

export function RankList({ from = 3, limit }: { from?: number; limit?: number }) {
  const { ranking } = useLiga();
  const rest = ranking.slice(from, limit ? from + limit : undefined);
  return (
    <ol className="rank-list" start={from + 1}>
      {rest.map((j, i) => (
        <li key={j.nick}>
          <span className="rank-pos pixel tabular">{from + i + 1}</span>
          <SkinHead nick={j.skin ?? j.nick} size={32} />
          <Link to={`/jogador/${encodeURIComponent(j.nick)}`} className="rank-nick">
            {j.nick}
          </Link>
          <span className="rank-pts">
            <span className="rank-pts-label">Pontos</span>
            <span className="pixel tabular">
              <CountUp value={j.pontos} duracao={900} />
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

const statusTxt = { 'em-breve': 'Em breve', 'em-andamento': 'Em andamento', encerrado: 'Encerrado' } as const;

export function TournamentCard({ t, full, aberto, onToggle }: { t: Torneio; full?: boolean; aberto?: boolean; onToggle?: () => void }) {
  const { data: ligaData } = useLiga();
  const resumo = (
    <>
      <header>
        <span className={`tourney-status s-${t.status}`}>{statusTxt[t.status]}</span>
        <h3 className="h-sub">{t.nome}</h3>
        <p className="tourney-meta">
          {t.formato}
          {' · '}
          {t.data ? fmtData(t.data) : <>data <Tbd /></>}
        </p>
      </header>
      <div className="tourney-champ">
        <span className="label">Campeão</span>
        {t.campeao ? (
          <span className="champ">
            <SkinHead nick={ligaData.jogadores.find((j) => j.nick === t.campeao)?.skin ?? t.campeao} size={28} />
            <b>{t.campeao}</b>
          </span>
        ) : (
          <span className="champ muted">{t.status === 'encerrado' ? '—' : 'A decidir'}</span>
        )}
      </div>
    </>
  );

  if (!full)
    return (
      <article className={`tourney s-${t.status}`}>
        <Link to={`/liga?torneio=${encodeURIComponent(t.id)}`} className="tourney-link" aria-label={`${t.nome}: ver detalhes na Liga`}>
          {resumo}
          <span className="tourney-more">
            Ver detalhes <ChevronDown size={15} aria-hidden />
          </span>
        </Link>
      </article>
    );

  return (
    <article id={`torneio-${t.id}`} className={`tourney s-${t.status}${aberto ? ' aberto' : ''}`}>
      <button type="button" className="tourney-toggle" aria-expanded={!!aberto} aria-controls={`td-${t.id}`} onClick={onToggle}>
        {resumo}
        <span className="tourney-more">
          {aberto ? 'Fechar detalhes' : 'Ver chaveamento, tabelas e times'} <ChevronDown size={15} aria-hidden className="tourney-chev" />
        </span>
      </button>
      {aberto && (
        <div id={`td-${t.id}`}>
          <TorneioDetalhe t={t} />
        </div>
      )}
    </article>
  );
}

export function RankingTabs({ children }: { children: (tab: 'jogadores' | 'torneios') => React.ReactNode }) {
  const [tab, setTab] = useState<'jogadores' | 'torneios'>('jogadores');
  return (
    <>
      <div className="rank-tabs" role="tablist" aria-label="Ranking">
        {(['jogadores', 'torneios'] as const).map((t) => (
          <button key={t} role="tab" type="button" aria-selected={tab === t} id={`tab-${t}`} aria-controls={`panel-${t}`} onClick={() => setTab(t)}>
            {t === 'jogadores' ? 'Jogadores' : 'Torneios'}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {children(tab)}
      </div>
    </>
  );
}
