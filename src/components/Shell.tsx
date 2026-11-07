import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, BookOpen, ChevronDown, Home, LogOut, Menu, Monitor, Moon, Search, ShieldCheck, Sun, User, Users, X } from 'lucide-react';
import { config } from '../config';
import { useSouAdmin } from '../lib/liga';
import { membroNick, membroSkin } from '../lib/skins';
import { useStore } from '../lib/store';
import { CopyIP, LogoSlot, ServerPill, SkinBody, SkinHead, Socials, Tbd } from './ui';

export const NAV = [
  { to: '/', label: 'Início', end: true },
  { to: '/lore', label: 'Lore' },
  { to: '/pokedex', label: 'Pokédex' },
  { to: '/times', label: 'Times' },
  { to: '/liga', label: 'Liga' },
  { to: '/jogadores', label: 'Jogadores' },
  { to: '/jogar', label: 'Jogar' },
];

/* ---------- tema das páginas de consulta ---------- */
type Tema = 'system' | 'light' | 'dark';
export function useTema(): [Tema, (t: Tema) => void] {
  const [t, set] = useState<Tema>(() => {
    try {
      return (localStorage.getItem('firma:tema') as Tema) || 'light';
    } catch {
      return 'light';
    }
  });
  const setT = (v: Tema) => {
    set(v);
    try {
      localStorage.setItem('firma:tema', v);
    } catch {
      /* ok */
    }
  };
  return [t, setT];
}

export function ThemeToggle({ tema, setTema }: { tema: Tema; setTema: (t: Tema) => void }) {
  const opts: { v: Tema; label: string; Icon: typeof Sun }[] = [
    { v: 'light', label: 'Claro', Icon: Sun },
    { v: 'dark', label: 'Escuro', Icon: Moon },
    { v: 'system', label: 'Sistema', Icon: Monitor },
  ];
  return (
    <div className="theme-toggle" role="radiogroup" aria-label="Tema da página">
      {opts.map(({ v, label, Icon }) => (
        <button key={v} type="button" role="radio" aria-checked={tema === v} title={label} onClick={() => setTema(v)}>
          <Icon size={15} aria-hidden />
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- header ---------- */
function AuthArea() {
  const { user, profile, entrar, sair, firebaseEnabled, pronto } = useStore();
  const [open, setOpen] = useState(false);
  const admin = useSouAdmin(user?.uid);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  if (!pronto) return <span className="auth-skel" aria-hidden />;
  if (!user)
    return (
      <button
        type="button"
        className="btn btn-green header-cta"
        onClick={entrar}
        title={firebaseEnabled ? undefined : 'Configure o Firebase para ativar o login'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.64 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.7 3.72 14.56 2.8 12 2.8 6.92 2.8 2.8 6.92 2.8 12s4.12 9.2 9.2 9.2c5.31 0 8.83-3.73 8.83-8.99 0-.6-.07-1.06-.15-1.51z" />
        </svg>
        <span className="hide-sm">Entrar com Google</span>
        <span className="show-sm">Entrar</span>
      </button>
    );
  const nick = profile.nick || user.nome || 'Treinador';
  return (
    <div className="avatar-menu" ref={ref}>
      <button type="button" className="avatar-btn" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)}>
        <SkinHead nick={profile.nick || 'MHF_Steve'} skin={profile.skin || undefined} size={30} />
        <span className="hide-sm">{nick}</span>
        <ChevronDown size={16} aria-hidden />
      </button>
      {open && (
        <div className="avatar-pop" role="menu">
          <Link role="menuitem" to="/perfil" onClick={() => setOpen(false)}>
            <User size={16} aria-hidden /> Meu perfil
          </Link>
          <Link role="menuitem" to="/times" onClick={() => setOpen(false)}>
            <Users size={16} aria-hidden /> Meus times
          </Link>
          {admin && (
            <Link role="menuitem" to="/admin" onClick={() => setOpen(false)}>
              <ShieldCheck size={16} aria-hidden /> Painel da Liga
            </Link>
          )}
          <button role="menuitem" type="button" onClick={() => { setOpen(false); sair(); }}>
            <LogOut size={16} aria-hidden /> Sair
          </button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { user } = useStore();
  const admin = useSouAdmin(user?.uid);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);
  // Menu aberto: trava a rolagem da página por baixo e fecha com Esc.
  useEffect(() => {
    if (!open) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => {
      document.body.style.overflow = antes;
      window.removeEventListener('keydown', esc);
    };
  }, [open]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);
  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link to="/" className="header-logo" aria-label="Firma League — início">
          <LogoSlot />
        </Link>
        <nav aria-label="Principal" className="pill-nav">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} end={n.end}>
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header-right">
          <AuthArea />
          <button type="button" className="btn btn-ghost btn-icon burger" aria-label="Abrir menu" aria-expanded={open} aria-controls="menu-movel" onClick={() => setOpen(true)}>
            <Menu size={20} aria-hidden />
          </button>
        </div>
      </div>
      {/* fora do header: o backdrop-filter do header prenderia o menu "tela cheia" dentro dele */}
      {open &&
        createPortal(
        <div className="mobile-sheet" id="menu-movel" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="mobile-sheet-top">
            <LogoSlot />
            <button type="button" className="btn btn-ghost btn-icon" aria-label="Fechar menu" onClick={() => setOpen(false)} autoFocus>
              <X size={20} aria-hidden />
            </button>
          </div>
          <nav aria-label="Menu móvel">
            <ul>
              {NAV.map((n) => (
                <li key={n.to}>
                  <NavLink to={n.to} end={n.end}>
                    {n.label}
                  </NavLink>
                </li>
              ))}
              <li>
                <NavLink to="/mods">Mods & Regras</NavLink>
              </li>
              <li>
                <NavLink to="/perfil">Perfil</NavLink>
              </li>
              {admin && (
                <li>
                  <NavLink to="/admin">Painel da Liga</NavLink>
                </li>
              )}
            </ul>
          </nav>
          <div className="mobile-sheet-foot">
            <ServerPill />
            <CopyIP compact />
          </div>
        </div>
      ,
          document.body,
        )}
    </header>
  );
}

/* ---------- barra inferior (consulta, celular) ---------- */
export function BottomBar() {
  const items = [
    { to: '/', label: 'Início', Icon: Home, end: true },
    { to: '/pokedex', label: 'Pokédex', Icon: Search },
    { to: '/times', label: 'Times', Icon: Users },
    { to: '/lore', label: 'Lore', Icon: BookOpen },
    { to: '/perfil', label: 'Perfil', Icon: User },
  ];
  return (
    <nav className="bottom-bar" aria-label="Atalhos">
      {items.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end}>
          <Icon size={20} aria-hidden />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

/* ---------- rodapé ---------- */
export function Footer() {
  const discord = config.redes.discord;
  const membros = config.membros;
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <LogoSlot />
          <ServerPill />
          <a className="community-card" href={discord ?? undefined} target={discord ? '_blank' : undefined} rel="noreferrer" aria-disabled={!discord}>
            <span className="cc-title display">Comunidade</span>
            <span className="cc-sub">Entre no Discord da Firma {!discord && <Tbd />}</span>
            <span className="cc-arrow" aria-hidden>
              <ArrowUpRight size={22} />
            </span>
          </a>
        </div>
        <nav className="footer-cols" aria-label="Rodapé">
          <div>
            <h2>Mapa do site</h2>
            <ul>
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to}>{n.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/mods">Mods & Regras</Link>
              </li>
              <li>
                <Link to="/perfil">Perfil</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2>Redes</h2>
            <Socials className="socials socials-list" />
          </div>
          <div>
            <h2>Documentos</h2>
            <ul>
              <li>
                <Link to="/regulamento">Regulamento da Liga</Link>
              </li>
              <li>
                <Link to="/privacidade">Política de privacidade</Link>
              </li>
              <li>
                <Link to="/sobre">Sobre</Link>
              </li>
            </ul>
          </div>
        </nav>
        <div className="footer-skins" aria-hidden="true">
          <SkinBody nick={membroNick(membros[2], 'MHF_Alex')} skin={membroSkin(membros[2])} facing="right" height={260} />
          <SkinBody nick={membroNick(membros[3], 'MHF_Steve')} skin={membroSkin(membros[3])} facing="left" height={260} />
        </div>
      </div>
      <div className="wrap footer-legal">
        <p className="footer-credit">
          <span>© {new Date().getFullYear()} Firma League</span>
          <span className="footer-dot" aria-hidden="true">·</span>
          <span className="footer-dev">
            Desenvolvido por
            <Link to="/sobre" className="fourtech">
              <FourtechMark /> {config.desenvolvedor}
            </Link>
          </span>
        </p>
        <p className="disclaimer">
          Projeto de fãs, sem fins lucrativos. Pokémon e seus personagens são marcas da Nintendo, Game Freak, Creatures e The
          Pokémon Company. Minecraft é marca da Mojang/Microsoft. Não afiliado a esses donos de marca nem à equipe do Cobblemon.
        </p>
      </div>
    </footer>
  );
}

function FourtechMark() {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return <img src="/assets/icon-fourtech.svg" alt="" width={14} height={18} onError={() => setOk(false)} className="fourtech-mark" />;
}

/* ---------- moldura das páginas de consulta ---------- */
/** Voltar: retorna à tela anterior do site (mantendo filtros e posição); sem histórico, vai para `to`. */
export function BackButton({ to, label }: { to: string; label: string }) {
  const nav = useNavigate();
  const loc = useLocation();
  return (
    <a
      href={to}
      className="back-link"
      onClick={(e) => {
        e.preventDefault();
        if (loc.key !== 'default' && window.history.length > 1) nav(-1);
        else nav(to);
      }}
    >
      <ArrowLeft size={18} aria-hidden /> {label}
    </a>
  );
}

export function Consult({
  children,
  title,
  intro,
  actions,
  back,
}: {
  children: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  actions?: ReactNode;
  back?: { to: string; label: string };
}) {
  const [tema, setTema] = useTema();
  return (
    <div className="consult" data-theme={tema === 'system' ? undefined : tema}>
      <div className="consult-head">
        <div className="wrap consult-head-row">
          <div>
            {back && <BackButton to={back.to} label={back.label} />}
            <h1 className="h-sec">{title}</h1>
            {intro && <p className="lede">{intro}</p>}
          </div>
          <div className="consult-head-actions">
            {actions}
            <ThemeToggle tema={tema} setTema={setTema} />
          </div>
        </div>
      </div>
      <div className="wrap consult-body">{children}</div>
    </div>
  );
}
