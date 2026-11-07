/**
 * Skin do hero com vida: mostra o render 2D na hora e, em telas grandes, troca por um boneco 3D
 * (skinview3d, carregado só depois).
 *
 * Em vez das animações prontas do skinview3d (que zeram a pose a cada troca e dão um "tranco"),
 * um único laço calcula a pose a cada quadro: respiração contínua + gesto atual com entrada e saída
 * suaves + cabeça seguindo o cursor. Cada personagem tem o próprio repertório de gestos.
 * Sem animação se o sistema pedir "reduzir movimento".
 */
import { useEffect, useRef, useState } from 'react';
import { reduzMovimento } from './Motion';
import { SkinBody } from './ui';

interface Props {
  nick: string;
  skin?: string;
  lado: 'left' | 'right';
}

/* ---------- pose ---------- */
interface Pose {
  /** braço de fora (do lado da borda da tela) e braço de dentro (do lado do card) */
  foraX: number;
  foraZ: number;
  dentroX: number;
  dentroZ: number;
  pernaE: number;
  pernaD: number;
  pulo: number;
  inclina: number;
  giro: number;
  cabecaX: number;
  cabecaY: number;
  cabecaZ: number;
  /** 0 = cabeça segue o mouse, 1 = o gesto controla a cabeça */
  dominaCabeca: number;
}
const zero = (): Pose => ({
  foraX: 0, foraZ: 0, dentroX: 0, dentroZ: 0, pernaE: 0, pernaD: 0, pulo: 0, inclina: 0, giro: 0, cabecaX: 0, cabecaY: 0, cabecaZ: 0, dominaCabeca: 0,
});

const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
/** entra nos primeiros 18% e sai nos últimos 22% do gesto */
const envelope = (p: number) => suave(0, 0.18, p) * (1 - suave(0.78, 1, p));
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

interface Gesto {
  nome: string;
  dur: number;
  pose: (p: number, t: number, e: number) => Partial<Pose>;
}

const G: Record<string, Gesto> = {
  aceno: {
    nome: 'aceno',
    dur: 2600,
    pose: (p, t, e) => ({ foraX: -2.75 * e, foraZ: (0.35 + Math.sin(t * 11) * 0.38) * e, cabecaZ: 0.08 * e, dominaCabeca: 0.25 * e }),
  },
  comemorar: {
    nome: 'comemorar',
    dur: 2400,
    pose: (p, t, e) => {
      const bomba = Math.abs(Math.sin(t * 9));
      return {
        foraX: (-2.9 + bomba * 0.35) * e,
        dentroX: (-2.9 + bomba * 0.35) * e,
        foraZ: 0.25 * e,
        dentroZ: 0.25 * e,
        pulo: bomba * 1.6 * e,
        cabecaX: -0.25 * e,
        dominaCabeca: 0.7 * e,
      };
    },
  },
  pulinho: {
    nome: 'pulinho',
    dur: 1500,
    pose: (p, t, e) => {
      const salto = Math.max(0, Math.sin(p * Math.PI * 2));
      return { pulo: salto * 4 * e, foraZ: salto * 0.5 * e, dentroZ: salto * 0.5 * e, pernaE: -salto * 0.25, pernaD: salto * 0.25 };
    },
  },
  apontar: {
    nome: 'apontar',
    dur: 2600,
    pose: (p, t, e) => ({ dentroX: -1.5 * e, dentroZ: -0.15 * e, cabecaY: 0, cabecaX: 0.05 * e, dominaCabeca: 0.8 * e }),
  },
  danca: {
    nome: 'dança',
    dur: 3200,
    pose: (p, t, e) => {
      const b = Math.sin(t * 7);
      return {
        foraX: b * 0.9 * e,
        dentroX: -b * 0.9 * e,
        pernaE: -b * 0.35 * e,
        pernaD: b * 0.35 * e,
        inclina: b * 0.07 * e,
        pulo: Math.abs(Math.cos(t * 7)) * 0.8 * e,
        cabecaZ: b * 0.12 * e,
      };
    },
  },
  olharEmVolta: {
    nome: 'olhar em volta',
    dur: 3000,
    pose: (p, t, e) => ({ cabecaY: Math.sin(p * Math.PI * 2) * 0.85 * e, cabecaX: 0.08 * e, dominaCabeca: e }),
  },
  cocarCabeca: {
    nome: 'coçar a cabeça',
    dur: 2600,
    pose: (p, t, e) => ({
      foraX: -2.85 * e,
      foraZ: (-0.32 + Math.sin(t * 14) * 0.07) * e,
      cabecaZ: -0.16 * e,
      cabecaX: 0.12 * e,
      dominaCabeca: 0.8 * e,
    }),
  },
  girar: {
    nome: 'girar',
    dur: 1900,
    pose: (p, t, e) => ({ giro: easeInOut(p) * Math.PI * 2, foraZ: 0.7 * e, dentroZ: 0.7 * e, pulo: Math.sin(p * Math.PI) * 1.5 }),
  },
};

/** Repertório de cada um: [gestos sorteados, gesto do mouse em cima, gesto de chegada] */
const PERSONALIDADE = {
  left: { gestos: [G.aceno, G.comemorar, G.pulinho, G.apontar, G.danca], hover: G.aceno, chegada: G.aceno },
  right: { gestos: [G.olharEmVolta, G.cocarCabeca, G.girar, G.danca, G.aceno], hover: G.girar, chegada: G.olharEmVolta },
};

export function HeroSkin({ nick, skin, lado }: Props) {
  const facing = lado === 'left' ? 'right' : 'left';
  const box = useRef<HTMLSpanElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [pronto3d, setPronto3d] = useState(false);
  const [usar3d] = useState(() => !!skin && !reduzMovimento() && typeof window !== 'undefined' && window.innerWidth > 900);

  useEffect(() => {
    if (!usar3d || !skin) return;
    let vivo = true;
    let limpar = () => {};
    const t0 = window.setTimeout(async () => {
      const sv = await import('skinview3d');
      const el = box.current;
      const cv = canvas.current;
      if (!vivo || !el || !cv) return;
      const h = el.getBoundingClientRect().height || 420;
      const v = new sv.SkinViewer({ canvas: cv, width: Math.round(h * 0.78), height: h, zoom: 0.92, fov: 30 });
      v.controls.enabled = false;
      v.autoRotate = false;
      v.animation = null;
      try {
        await v.loadSkin(skin, { model: 'auto-detect' });
      } catch {
        v.dispose();
        return;
      }
      if (!vivo) return v.dispose();
      setPronto3d(true);

      const P = PERSONALIDADE[lado];
      const baseY = lado === 'left' ? 0.55 : -0.55;
      // "fora" = braço do lado da borda da tela; "dentro" = do lado do card
      const s = v.playerObject.skin;
      const fora = lado === 'left' ? s.rightArm : s.leftArm;
      const dentro = lado === 'left' ? s.leftArm : s.rightArm;
      const sinalFora = lado === 'left' ? -1 : 1; // rotação z que abre o braço para fora
      const sinalDentro = -sinalFora;

      /* ----- gestos ----- */
      let atual: { g: Gesto; ini: number } | null = null;
      let ultimoNome = '';
      let proximo = performance.now() + (lado === 'left' ? 900 : 1900);
      let fila: Gesto | null = P.chegada;
      const tocar = (g: Gesto) => {
        if (atual) return false;
        atual = { g, ini: performance.now() };
        ultimoNome = g.nome;
        return true;
      };
      const sortear = () => {
        const op = P.gestos.filter((g) => g.nome !== ultimoNome);
        return op[Math.floor(Math.random() * op.length)];
      };

      /* ----- cabeça seguindo o mouse ----- */
      const alvo = { x: 0, y: 0 };
      const olhar = { x: 0, y: 0 };
      let ultimoMovimento = 0;
      const mover = (e: PointerEvent) => {
        const r = cv.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.18;
        alvo.y = Math.max(-0.9, Math.min(0.9, (e.clientX - cx) / 600 - baseY * 0.6));
        alvo.x = Math.max(-0.45, Math.min(0.45, (e.clientY - cy) / 900));
        ultimoMovimento = performance.now();
      };
      const saiu = (e: PointerEvent) => {
        if (!e.relatedTarget) {
          alvo.x = 0;
          alvo.y = 0;
        }
      };

      /* ----- laço ----- */
      const pose = zero();
      let ant = performance.now();
      let raf = 0;
      const loop = (agora: number) => {
        const dt = Math.min(0.05, (agora - ant) / 1000);
        ant = agora;
        const t = agora / 1000;

        // escolhe o próximo gesto
        if (!atual && agora >= proximo) {
          tocar(fila ?? sortear());
          fila = null;
        }
        // sem mexer o mouse por um tempo, a cabeça volta devagar ao centro
        if (agora - ultimoMovimento > 5000) {
          alvo.x *= 0.995;
          alvo.y *= 0.995;
        }

        // pose do gesto
        let g: Partial<Pose> = {};
        if (atual) {
          const p = (agora - atual.ini) / atual.g.dur;
          if (p >= 1) {
            atual = null;
            // gesto pedido pelo mouse no meio de outro: emenda logo; senão, espera um pouco
            proximo = agora + (fila ? 350 : 4200 + Math.random() * 4800);
          } else g = atual.g.pose(p, t, envelope(p));
        }

        // suaviza a pose (independe da taxa de quadros)
        const k = 1 - Math.exp(-dt * 14);
        const alvoPose = { ...zero(), ...g };
        (Object.keys(pose) as (keyof Pose)[]).forEach((c) => {
          if (c === 'giro') pose.giro = alvoPose.giro; // o giro já vem suavizado
          else pose[c] += (alvoPose[c] - pose[c]) * k;
        });
        const kc = 1 - Math.exp(-dt * 5);
        olhar.x += (alvo.x - olhar.x) * kc;
        olhar.y += (alvo.y - olhar.y) * kc;

        // respiração contínua
        const resp = Math.sin(t * 1.9);
        fora.rotation.x = pose.foraX + Math.sin(t * 1.3) * 0.03;
        fora.rotation.z = sinalFora * (0.06 + resp * 0.03 + pose.foraZ);
        fora.rotation.y = 0;
        dentro.rotation.x = pose.dentroX - Math.sin(t * 1.3) * 0.03;
        dentro.rotation.z = sinalDentro * (0.06 + resp * 0.03 + pose.dentroZ);
        s.leftLeg.rotation.x = pose.pernaE;
        s.rightLeg.rotation.x = pose.pernaD;
        s.body.rotation.y = 0;
        v.playerObject.position.y = pose.pulo + resp * 0.12;
        v.playerObject.rotation.z = pose.inclina;
        v.playerWrapper.rotation.y = baseY + pose.giro;
        const d = pose.dominaCabeca;
        s.head.rotation.x = olhar.x * (1 - d) + pose.cabecaX;
        s.head.rotation.y = olhar.y * (1 - d) + pose.cabecaY;
        s.head.rotation.z = pose.cabecaZ;

        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      window.addEventListener('pointermove', mover, { passive: true });
      document.documentElement.addEventListener('pointerleave', saiu);
      let ultimoHover = 0;
      const hover = () => {
        const agora = performance.now();
        if (agora - ultimoHover < 1500) return;
        ultimoHover = agora;
        if (!tocar(P.hover)) fila = P.hover;
        else proximo = Infinity;
      };
      cv.addEventListener('pointerenter', hover);

      // pausa tudo quando sai da tela
      const io = new IntersectionObserver(([e]) => {
        v.renderPaused = !e.isIntersecting;
        cancelAnimationFrame(raf);
        if (e.isIntersecting) {
          ant = performance.now();
          raf = requestAnimationFrame(loop);
        }
      });
      io.observe(cv);

      limpar = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', mover);
        document.documentElement.removeEventListener('pointerleave', saiu);
        cv.removeEventListener('pointerenter', hover);
        io.disconnect();
        v.dispose();
      };
    }, 700);
    return () => {
      vivo = false;
      window.clearTimeout(t0);
      limpar();
    };
  }, [usar3d, skin, lado]);

  return (
    <span ref={box} className={`hero-skin ${lado}${pronto3d ? ' is-3d' : ''}`}>
      <SkinBody nick={nick} skin={skin} facing={facing} height={420} className="hero-skin-2d" />
      {usar3d && <canvas ref={canvas} className="hero-skin-3d" aria-hidden="true" />}
    </span>
  );
}
