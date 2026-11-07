import { Component, lazy, type ComponentType, type ReactNode } from 'react';
import { RotateCw } from 'lucide-react';

const FLAG = 'firma:recarregou';

/** Erro de "arquivo da página não encontrado" — acontece quando sai uma versão nova do site com a aba aberta. */
export function isChunkError(e: unknown): boolean {
  const m = String((e as Error)?.message ?? e);
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported|Failed to fetch/i.test(m);
}

/** Recarrega a página uma vez (por URL) para buscar a versão nova do site. */
export function recarregarUmaVez(): boolean {
  try {
    const k = FLAG + ':' + location.pathname;
    if (sessionStorage.getItem(k)) return false;
    sessionStorage.setItem(k, String(Date.now()));
  } catch {
    /* sem sessionStorage: recarrega mesmo assim */
  }
  location.reload();
  return true;
}

/** `lazy` que, se o arquivo da página sumiu (versão nova publicada), recarrega a página em vez de quebrar. */
export function lazyPage<T extends ComponentType<any>>(load: () => Promise<{ default: T }>) {
  return lazy(() =>
    load().catch((e) => {
      if (isChunkError(e) && recarregarUmaVez()) return new Promise<{ default: T }>(() => {});
      throw e;
    }),
  );
}

/** Se uma página quebrar, mostra um aviso no lugar dela (cabeçalho e rodapé continuam funcionando). */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { erro: unknown }> {
  state = { erro: null as unknown };
  static getDerivedStateFromError(erro: unknown) {
    return { erro };
  }
  componentDidCatch(erro: unknown) {
    if (isChunkError(erro)) recarregarUmaVez();
    console.error(erro);
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.erro) this.setState({ erro: null });
  }
  render() {
    if (!this.state.erro) return this.props.children;
    const versao = isChunkError(this.state.erro);
    return (
      <main id="conteudo" className="crash">
        <div className="wrap">
          <h1 className="h-sec">{versao ? 'Saiu uma versão nova do site' : 'Algo deu errado nesta página'}</h1>
          <p className="lede">
            {versao
              ? 'Recarregue para continuar de onde parou. Seus times e seu perfil continuam salvos.'
              : 'Recarregue a página. Se continuar acontecendo, avise a organização da Firma dizendo em qual tela foi.'}
          </p>
          <button type="button" className="btn btn-coral" onClick={() => location.reload()}>
            <RotateCw size={18} aria-hidden /> Recarregar
          </button>
        </div>
      </main>
    );
  }
}

/** Limpa as marcas de recarga depois que a página carregou bem. */
export function limparMarcasDeRecarga() {
  try {
    for (const k of Object.keys(sessionStorage)) if (k.startsWith(FLAG)) sessionStorage.removeItem(k);
  } catch {
    /* ok */
  }
}
