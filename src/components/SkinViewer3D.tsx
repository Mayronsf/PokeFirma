import { useEffect, useRef, useState } from 'react';

/** Visualizador 3D interativo (arrastar para girar). Carrega o skinview3d só quando aparece. */
export default function SkinViewer3D({ texture, height = 300 }: { texture: string; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [erro, setErro] = useState(false);
  useEffect(() => {
    let viewer: { dispose: () => void } | null = null;
    let alive = true;
    setErro(false);
    import('skinview3d').then(async ({ SkinViewer, IdleAnimation }) => {
      if (!alive || !ref.current) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const v = new SkinViewer({ canvas: ref.current, width: Math.round(height * 0.7), height, zoom: 0.9, fov: 32 });
      viewer = v;
      v.playerObject.rotation.y = 0.5;
      v.autoRotate = false;
      if (!reduce) v.animation = new IdleAnimation();
      try {
        await v.loadSkin(texture, { model: 'auto-detect' });
      } catch {
        if (alive) setErro(true);
      }
    });
    return () => {
      alive = false;
      viewer?.dispose();
    };
  }, [texture, height]);
  return (
    <div className="skin-3d">
      <canvas ref={ref} aria-label="Sua skin em 3D. Arraste para girar." role="img" />
      {erro && <p className="small">Não consegui carregar essa skin.</p>}
    </div>
  );
}
