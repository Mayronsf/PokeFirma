import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Download, ImageIcon } from 'lucide-react';
import { A_DEFINIR, config } from '../config';
import { destaques, faq } from '../content/mods';
import { CopyIP, ServerPill, Tbd } from '../components/ui';
import { useServerStatus } from '../lib/useServerStatus';
import { fmtData } from '../lib/pt';
import '../styles/home.css';
import '../styles/dex.css';
import '../styles/pages.css';

const m = config.modpack;

const OPCOES = [
  {
    id: 'cliente',
    nome: 'Cliente completo',
    sub: 'Novos jogadores',
    passos: [
      <>Baixe o arquivo <code>Firma-League-NeoForge-{m.versao}.zip</code> {config.modpack.downloads.cliente ? <a href={config.modpack.downloads.cliente}>(baixar)</a> : <Tbd />}.</>,
      <>
        Abra seu launcher. No <b>CurseForge App</b>: <i>Create Custom Profile</i> → link <i>Import</i> no topo → selecione o .zip. No{' '}
        <b>Prism Launcher</b>: <i>Add Instance</i> → <i>Import from zip</i> → selecione o arquivo e OK.
      </>,
      <>Configure {m.ramCliente} de RAM nas configurações da instância (<code>-Xmx6G</code>).</>,
      <>Clique em Play, entre em Multiplayer e cole o IP do servidor.</>,
      <>
        No servidor, digite <code>/vincular</code> no chat e cole o código em <Link to="/perfil">Perfil</Link>: seu nick, insígnias, time e PC
        passam a aparecer aqui no site.
      </>,
    ],
  },
  {
    id: 'atualizacao',
    nome: 'Atualização rápida',
    sub: 'Quem já tem a instância',
    passos: [
      <>Baixe <code>Firma-League-NeoForge-Atualizacao.zip</code> {config.modpack.downloads.atualizacao ? <a href={config.modpack.downloads.atualizacao}>(baixar)</a> : <Tbd />}.</>,
      <>Abra a pasta da instância no CurseForge ou no Prism (botão direito → <i>Open Folder</i>).</>,
      <>Extraia o conteúdo do zip dentro da pasta e aceite substituir todos os arquivos.</>,
      <>Abra o jogo normalmente: mundos, waypoints e binds são preservados.</>,
    ],
  },
  {
    id: 'servidor',
    nome: 'Servidor dedicado',
    sub: 'Hosts pagas',
    passos: [
      <>Baixe <code>Firma-League-Server-NeoForge-{m.versao}.zip</code> {config.modpack.downloads.servidor ? <a href={config.modpack.downloads.servidor}>(baixar)</a> : <Tbd />}.</>,
      <>Na sua host (PebbleHost, Shockbyte, Bisect, Apex…), escolha <b>NeoForge 1.21.1</b> (versão {m.loaderVersao} ou mais recente).</>,
      <>Envie o .zip para a raiz por FTP ou pelo painel e extraia. Ele já traz os {m.modsServidor} mods de servidor, <code>config/</code>, <code>kubejs/</code>, <code>server.properties</code> com <code>allow-flight=true</code> e <code>eula=true</code>.</>,
      <>Inicie o servidor e mande o IP para a Firma.</>,
    ],
  },
];

function Status() {
  const s = useServerStatus();
  return (
    <dl className="srv-status">
      <div>
        <dt>Status</dt>
        <dd>{s.estado === 'online' ? 'Online' : s.estado === 'offline' ? 'Offline' : s.estado === 'sem-ip' ? <Tbd /> : '—'}</dd>
      </div>
      <div>
        <dt>Jogadores</dt>
        <dd className="pixel tabular">
          {s.estado === 'online' ? `${s.online}/${s.max ?? config.servidor.limiteJogadores ?? '?'}` : '—'}
        </dd>
      </div>
      <div>
        <dt>Versão</dt>
        <dd>{s.versao ?? `${m.loader} ${m.minecraft}`}</dd>
      </div>
    </dl>
  );
}

export default function Jogar() {
  const [tab, setTab] = useState(OPCOES[0].id);
  const op = OPCOES.find((o) => o.id === tab)!;
  return (
    <main id="conteudo" className="jogar">
      <section className="jogar-hero">
        <div className="wrap jogar-hero-grid">
          <div>
            <h1 className="display jogar-title">
              Comece a <span className="serif-i">jogar</span>
            </h1>
            <p className="lede">
              Baixe o modpack, importe no CurseForge ou no Prism e entre no servidor da Firma. Sem portas de roteador, sem caça a mods.
            </p>
          </div>
          <div className="download-card">
            <a
              className="btn btn-coral btn-lg"
              href={m.downloads.cliente ?? undefined}
              aria-disabled={!m.downloads.cliente}
              onClick={(e) => !m.downloads.cliente && e.preventDefault()}
            >
              <Download size={20} aria-hidden /> Baixar modpack (.zip)
            </a>
            <p className="download-meta">
              v{m.versao} · {m.loader} {m.minecraft} · {m.dataVersao ? fmtData(m.dataVersao) : <>data <Tbd /></>}
              {!m.downloads.cliente && <> · link <Tbd /></>}
            </p>
            <div className="download-ip">
              <CopyIP />
              <ServerPill />
            </div>
            <Status />
          </div>
        </div>
      </section>

      <section className="paper">
        <div className="wrap">
          <h2 className="h-sec">Requisitos</h2>
          <dl className="reqs">
            <div>
              <dt>Minecraft</dt>
              <dd className="display">{m.minecraft}</dd>
            </div>
            <div>
              <dt>Loader</dt>
              <dd className="display">
                {m.loader} {m.loaderVersao}+
              </dd>
            </div>
            <div>
              <dt>Java</dt>
              <dd className="display">{m.java.replace('Java ', 'Java ')}</dd>
            </div>
            <div>
              <dt>RAM cliente</dt>
              <dd className="display">{m.ramCliente}</dd>
            </div>
            <div>
              <dt>Mods</dt>
              <dd className="display">{m.modsCliente}</dd>
            </div>
          </dl>

          <div className="install">
            <h2 className="h-sec">
              Passo a <span className="serif-i">passo</span>
            </h2>
            <div className="seg install-tabs" role="tablist" aria-label="Forma de instalar">
              {OPCOES.map((o) => (
                <button key={o.id} type="button" role="tab" aria-selected={tab === o.id} id={`t-${o.id}`} aria-controls="install-panel" onClick={() => setTab(o.id)}>
                  {o.nome}
                  <span className="tab-sub">{o.sub}</span>
                </button>
              ))}
            </div>
            <ol className="steps" id="install-panel" role="tabpanel" aria-labelledby={`t-${op.id}`}>
              {op.passos.map((p, i) => (
                <li key={i} className="step">
                  <span className="step-num slot lit" aria-hidden="true">
                    <span className="pixel">{i + 1}</span>
                  </span>
                  <div className="step-body">
                    <p>{p}</p>
                    <figure className="shot" aria-label={`Espaço para print do passo ${i + 1}`}>
                      <ImageIcon size={22} aria-hidden />
                      <figcaption>Print do passo {i + 1} · {A_DEFINIR}</figcaption>
                    </figure>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mods-sum">
        <div className="wrap">
          <div className="community-head">
            <h2 className="h-sec">
              Os mods <span className="serif-i">na história</span>
            </h2>
            <Link to="/mods" className="text-link on-dark">
              Lista completa ({m.modsCliente} mods) e regras <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <ul className="mod-cards">
            {destaques.map((d) => (
              <li key={d.nome}>
                <h3>{d.nome}</h3>
                <p>{d.papel}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="paper">
        <div className="wrap faq-wrap">
          <h2 className="h-sec">
            Perguntas <span className="serif-i">frequentes</span>
          </h2>
          <div className="faq">
            {faq.map((f) => (
              <details key={f.p}>
                <summary>
                  {f.p}
                  <ChevronDown className="faq-chev" size={20} aria-hidden />
                </summary>
                <p>
                  {f.r}
                  {f.p.includes('Discord') && !config.redes.discord && (
                    <>
                      {' '}
                      Link do Discord: <Tbd />
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
