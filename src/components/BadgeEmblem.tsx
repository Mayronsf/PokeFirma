import { Crown, Shield } from 'lucide-react';
import { badgeUrl, type Insignia } from '../content/lore';

/**
 * Insígnia: arte oficial da PokéAPI (sprites/badges) para os 8 ginásios de cada região;
 * Elite Four e Campeão (que não têm arte na API) usam um emblema próprio em dourado.
 * Faltando = em cinza e apagada.
 */
export function BadgeEmblem({ ins, owned, size = 56 }: { ins: Insignia; owned: boolean; size?: number }) {
  if (ins.badge)
    return (
      <span className={`badge-art${owned ? ' owned' : ''}`} style={{ width: size, height: size }} aria-hidden="true">
        <img src={badgeUrl(ins.badge)} alt="" width={size} height={size} loading="lazy" />
      </span>
    );
  const Icon = ins.id.endsWith('campeao') ? Crown : Shield;
  return (
    <span className={`emblem special${owned ? ' owned' : ''}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 48 48" width={size} height={size}>
        <path d="M24 3 L42 13.5 L42 34.5 L24 45 L6 34.5 L6 13.5 Z" className="emblem-shape" />
        <path d="M24 3 L42 13.5 L42 34.5 L24 45 L6 34.5 L6 13.5 Z" className="emblem-inner" transform="translate(24 24) scale(0.74) translate(-24 -24)" />
      </svg>
      <span className="emblem-glyph">
        <Icon size={Math.round(size * 0.38)} strokeWidth={2.4} />
      </span>
    </span>
  );
}
