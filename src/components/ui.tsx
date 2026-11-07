import { useEffect, useState, type ReactNode } from 'react';
import { AlertTriangle, Ban, Check, Copy, Info, RotateCw } from 'lucide-react';
import { siDiscord, siTiktok, siYoutube } from 'simple-icons';
import { A_DEFINIR, config } from '../config';
import { typePt } from '../lib/pt';
import { FALLBACK_HEAD, bodyFromTexture, bodyUrl, headFromTexture, headUrl } from '../lib/skins';
import { useServerStatus } from '../lib/useServerStatus';
import { membroNick, membroSkin } from '../lib/skins';
import { skinEnviadaDe, useStore } from '../lib/store';

export function Tbd({ children = A_DEFINIR }: { children?: ReactNode }) {
  return <span className="tbd">{children}</span>;
}

export function TypeBadge({ type, small }: { type: string; small?: boolean }) {
  return <span className={`type t-${type}${small ? ' type-sm' : ''}`}>{typePt[type] ?? type}</span>;
}

/**
 * Resolve a skin de um nick: a enviada pelo próprio usuário logado, a de um membro configurado
 * (config.membros) ou a enviada por um jogador com perfil público. Sem nenhuma = skin do nick.
 */
export function useSkinDe(nick: string, skin?: string): string | undefined {
  const { profile } = useStore();
  const [remota, setRemota] = useState<string | undefined>(undefined);
  const n = (nick || '').toLowerCase();
  const local =
    skin !== undefined
      ? skin || undefined
      : profile.nick && n === profile.nick.toLowerCase() && profile.skin
        ? profile.skin
        : membroSkin(config.membros.find((m) => membroNick(m, '').toLowerCase() === n));
  useEffect(() => {
    if (local || skin !== undefined || !n) return setRemota(undefined);
    let alive = true;
    skinEnviadaDe(n).then((s) => alive && setRemota(s));
    return () => {
      alive = false;
    };
  }, [n, local, skin]);
  return local ?? remota;
}

/** Foto de perfil = cabeça da skin do treinador (por nick, membro configurado ou arquivo enviado). */
export function SkinHead({ nick, skin: skinProp, size = 40, className }: { nick: string; skin?: string; size?: number; className?: string }) {
  const skin = useSkinDe(nick, skinProp);
  const [fromTex, setFromTex] = useState<string | null>(null);
  useEffect(() => {
    if (!skin) return setFromTex(null);
    let alive = true;
    headFromTexture(skin, 64)
      .then((u) => alive && setFromTex(u))
      .catch(() => alive && setFromTex(FALLBACK_HEAD));
    return () => {
      alive = false;
    };
  }, [skin]);
  return (
    <img
      className={className}
      src={skin ? fromTex ?? FALLBACK_HEAD : headUrl(nick, Math.min(128, size * 2))}
      width={size}
      height={size}
      alt=""
      loading="lazy"
      style={{ imageRendering: 'pixelated', borderRadius: 6 }}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).src = FALLBACK_HEAD;
      }}
    />
  );
}

/** Corpo inteiro: render do mc-heads por nick, ou render 3D próprio da textura enviada (`skin`). */
export function SkinBody({
  nick,
  skin: skinProp,
  facing = 'right',
  height = 320,
  className,
}: {
  nick: string;
  skin?: string;
  facing?: 'left' | 'right';
  height?: number;
  className?: string;
}) {
  const skin = useSkinDe(nick, skinProp);
  const [ok, setOk] = useState(true);
  const [fromTex, setFromTex] = useState<string | null>(null);
  useEffect(() => {
    setOk(true);
    if (!skin) return setFromTex(null);
    let alive = true;
    bodyFromTexture(skin, facing, Math.max(320, height))
      .then((u) => alive && setFromTex(u))
      .catch(() => alive && setOk(false));
    return () => {
      alive = false;
    };
  }, [skin, facing, height]);
  if (!ok) return null;
  if (skin && !fromTex) return <span className={className} aria-hidden="true" style={{ display: 'inline-block', aspectRatio: '0.62' }} />;
  return (
    <img
      className={className}
      src={skin ? fromTex! : bodyUrl(nick, height, facing)}
      alt={`Skin de ${nick.replace(/^MHF_/, '')}`}
      loading="lazy"
      onError={() => setOk(false)}
    />
  );
}

const SOCIAL = [
  { key: 'discord', nome: 'Discord', icon: siDiscord },
  { key: 'youtube', nome: 'YouTube', icon: siYoutube },
  { key: 'tiktok', nome: 'TikTok', icon: siTiktok },
] as const;

export function BrandIcon({ path, size = 18 }: { path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d={path} />
    </svg>
  );
}

export function Socials({ className = 'socials' }: { className?: string }) {
  return (
    <ul className={className} aria-label="Redes da Firma">
      {SOCIAL.map((s) => {
        const href = config.redes[s.key];
        return (
          <li key={s.key}>
            {href ? (
              <a href={href} target="_blank" rel="noreferrer" aria-label={s.nome} title={s.nome}>
                <BrandIcon path={s.icon.path} />
              </a>
            ) : (
              <span aria-label={`${s.nome}: link ${A_DEFINIR}`} title={`${s.nome}: link ${A_DEFINIR}`} className="is-tbd">
                <BrandIcon path={s.icon.path} />
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function ServerPill({ className = 'server-pill' }: { className?: string }) {
  const s = useServerStatus();
  let dot = 'off';
  let text: ReactNode;
  if (s.estado === 'sem-ip') text = <>Servidor <Tbd /></>;
  else if (s.estado === 'carregando') text = 'Verificando servidor…';
  else if (s.estado === 'online') {
    dot = 'on';
    text = (
      <>
        <b className="pixel tabular">{s.online}</b> {s.online === 1 ? 'jogador online' : 'jogadores online'}
      </>
    );
  } else if (s.estado === 'offline') text = 'Servidor offline';
  else text = 'Status indisponível';
  return (
    <span className={className} role="status" aria-live="polite">
      <i className={`dot dot-${dot}`} aria-hidden="true" />
      <span>{text}</span>
    </span>
  );
}

export function CopyIP({ compact }: { compact?: boolean }) {
  const [ok, setOk] = useState(false);
  const ip = config.servidor.ip;
  useEffect(() => {
    if (!ok) return;
    const t = setTimeout(() => setOk(false), 2200);
    return () => clearTimeout(t);
  }, [ok]);
  if (!ip)
    return (
      <span className="ip-box is-empty">
        <span className="ip-label">IP</span> <Tbd />
      </span>
    );
  return (
    <button
      type="button"
      className={`ip-box${compact ? ' compact' : ''}`}
      onClick={() => navigator.clipboard?.writeText(ip).then(() => setOk(true))}
      aria-label={`Copiar IP do servidor: ${ip}`}
    >
      <span className="ip-label">IP</span>
      <span className="ip-value">{ip}</span>
      <span className="ip-action">
        {ok ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
        {ok ? 'Copiado' : 'Copiar IP'}
      </span>
    </button>
  );
}

export function Note({ nivel, children }: { nivel: 'erro' | 'aviso' | 'info'; children: ReactNode }) {
  const Icon = nivel === 'erro' ? Ban : nivel === 'aviso' ? AlertTriangle : Info;
  return (
    <div className={`note note-${nivel}`} role={nivel === 'erro' ? 'alert' : undefined}>
      <Icon size={16} aria-hidden />
      <span>{children}</span>
    </div>
  );
}

export function ErrorRetry({ onRetry, msg = 'Não consegui carregar os dados da PokéAPI.' }: { onRetry: () => void; msg?: string }) {
  return (
    <div className="state-box" role="alert">
      <p>
        <b>{msg}</b> Pode ser a conexão ou a PokéAPI fora do ar por um instante.
      </p>
      <button type="button" className="btn btn-sm" onClick={onRetry}>
        <RotateCw size={16} aria-hidden /> Tentar de novo
      </button>
    </div>
  );
}

export function LogoSlot({ className = 'logo' }: { className?: string }) {
  const [img, setImg] = useState(true);
  return (
    <span className={className}>
      {img ? (
        <picture>
          <source srcSet="/assets/logo-firma.webp" type="image/webp" />
          <img src="/assets/logo-firma.png" alt="Firma League" width={480} height={270} onError={() => setImg(false)} />
        </picture>
      ) : (
        <span className="logo-fallback" aria-label="Firma League">
          <span className="logo-mark" aria-hidden="true">
            F
          </span>
          <span className="logo-word" aria-hidden="true">
            Firma<span>League</span>
          </span>
        </span>
      )}
    </span>
  );
}
