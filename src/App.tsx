import { Suspense, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Route, Routes, useLocation, useNavigationType, type Location } from 'react-router-dom';
import { X } from 'lucide-react';
import { Footer, Header } from './components/Shell';
import { NickOnboarding } from './components/NickOnboarding';
import { ErrorBoundary, lazyPage, limparMarcasDeRecarga } from './components/ErrorBoundary';
import { useStore } from './lib/store';
import Home from './pages/Home';

const Lore = lazyPage(() => import('./pages/Lore'));
const Pokedex = lazyPage(() => import('./pages/Pokedex'));
const PokemonPage = lazyPage(() => import('./pages/PokemonPage'));
const Teams = lazyPage(() => import('./pages/Teams'));
const TeamEditor = lazyPage(() => import('./pages/TeamEditor'));
const TeamView = lazyPage(() => import('./pages/TeamView'));
const Community = lazyPage(() => import('./pages/Community'));
const Profile = lazyPage(() => import('./pages/Profile'));
const PlayerPublic = lazyPage(() => import('./pages/PlayerPublic'));
const Jogar = lazyPage(() => import('./pages/Jogar'));
const Mods = lazyPage(() => import('./pages/Mods'));
const Liga = lazyPage(() => import('./pages/Liga'));
const Regulamento = lazyPage(() => import('./pages/Regulamento'));
const Sobre = lazyPage(() => import('./pages/Sobre'));
const Privacidade = lazyPage(() => import('./pages/Privacidade'));
const NotFound = lazyPage(() => import('./pages/NotFound'));
const Admin = lazyPage(() => import('./pages/Admin'));
const Jogadores = lazyPage(() => import('./pages/Jogadores'));


const TITLES: [RegExp, string][] = [
  [/^\/lore/, 'Lore'],
  [/^\/pokedex\/.+/, 'Pokédex'],
  [/^\/pokedex/, 'Pokédex'],
  [/^\/times/, 'Times'],
  [/^\/time\//, 'Time'],
  [/^\/perfil/, 'Perfil'],
  [/^\/jogadores/, 'Jogadores'],
  [/^\/jogador\//, 'Jogador'],
  [/^\/admin/, 'Painel da Liga'],
  [/^\/jogar/, 'Jogar'],
  [/^\/mods/, 'Mods & Regras'],
  [/^\/liga/, 'Liga'],
  [/^\/regulamento/, 'Regulamento'],
  [/^\/sobre/, 'Sobre'],
  [/^\/privacidade/, 'Privacidade'],
];

function PageFallback() {
  return (
    <div className="page-loading" role="status">
      <span className="sr-only">Carregando…</span>
    </div>
  );
}

function ErrorToast() {
  const { erro, limparErro } = useStore();
  if (!erro) return null;
  return (
    <div className="toast" role="alert">
      <span>{erro}</span>
      <button type="button" className="btn btn-sm btn-ghost btn-icon" aria-label="Fechar aviso" onClick={limparErro}>
        <X size={16} aria-hidden />
      </button>
    </div>
  );
}

const scrolls = new Map<string, number>();

/**
 * Troca de página suave: a tela antiga some e a nova entra (View Transitions API, quando o navegador tem;
 * senão, só a entrada em CSS). Só anima quando muda o caminho, não em filtros (?q=) nem âncoras (#).
 */
function useLocalExibido(): [Location, boolean] {
  const real = useLocation();
  const [exibido, setExibido] = useState(real);
  const [entrando, setEntrando] = useState(false);
  useEffect(() => {
    if (real === exibido) return;
    const mudouPagina = real.pathname !== exibido.pathname;
    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    if (!mudouPagina || reduz) {
      setExibido(real);
      return;
    }
    if (doc.startViewTransition) {
      doc.startViewTransition(() => flushSync(() => setExibido(real)));
    } else {
      setExibido(real);
      setEntrando(true);
    }
  }, [real, exibido]);
  useEffect(() => {
    if (!entrando) return;
    const t = setTimeout(() => setEntrando(false), 450);
    return () => clearTimeout(t);
  }, [entrando]);
  return [exibido, entrando];
}

export default function App() {
  const [loc, entrando] = useLocalExibido();
  const navType = useNavigationType();
  // Guarda a rolagem de cada tela e restaura ao voltar (botão Voltar ou do navegador).
  useEffect(() => {
    const key = loc.key;
    const save = () => scrolls.set(key, window.scrollY);
    window.addEventListener('scroll', save, { passive: true });
    if (navType === 'POP' && scrolls.has(key)) {
      const y = scrolls.get(key)!;
      let tries = 0;
      const tick = () => {
        window.scrollTo(0, y);
        if (Math.abs(window.scrollY - y) > 4 && tries++ < 30) setTimeout(tick, 100);
      };
      tick();
    }
    return () => window.removeEventListener('scroll', save);
  }, [loc.key, navType]);
  useEffect(() => {
    const t = setTimeout(limparMarcasDeRecarga, 10000);
    return () => clearTimeout(t);
  }, [loc.pathname]);
  useEffect(() => {
    if (!loc.hash && navType !== 'POP') window.scrollTo(0, 0);
    const t = TITLES.find(([re]) => re.test(loc.pathname))?.[1];
    document.title = t ? `${t} · Firma League` : 'Firma League';
  }, [loc.pathname, loc.hash]);
  useEffect(() => {
    if (!loc.hash) return;
    const id = decodeURIComponent(loc.hash.slice(1));
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }), 120);
    return () => clearTimeout(t);
  }, [loc.hash, loc.pathname]);

  return (
    <div>
      <a href="#conteudo" className="skip">
        Pular para o conteúdo
      </a>
      <Header />
      <ErrorBoundary resetKey={loc.pathname}>
      <Suspense fallback={<PageFallback />}>
        <div key={loc.pathname} className={entrando ? 'page-swap page-enter' : 'page-swap'}>
        <Routes location={loc}>
          <Route path="/" element={<Home />} />
          <Route path="/lore" element={<Lore />} />
          <Route path="/pokedex" element={<Pokedex />} />
          <Route path="/pokedex/:id" element={<PokemonPage />} />
          <Route path="/times" element={<Teams />} />
          <Route path="/times/comunidade" element={<Community />} />
          <Route path="/times/exemplo/:id" element={<TeamView />} />
          <Route path="/times/:teamId" element={<TeamEditor />} />
          <Route path="/time/:uid/:teamId" element={<TeamView />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/jogador/:nick" element={<PlayerPublic />} />
          <Route path="/jogar" element={<Jogar />} />
          <Route path="/mods" element={<Mods />} />
          <Route path="/liga" element={<Liga />} />
          <Route path="/regulamento" element={<Regulamento />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/jogadores" element={<Jogadores />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </div>
      </Suspense>
      </ErrorBoundary>
      <Footer />
      <NickOnboarding />
      <ErrorToast />
    </div>
  );
}
