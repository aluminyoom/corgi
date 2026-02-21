import { definePlugin } from '../api';
import { bridgeRequest } from '@/bridge/main-side';

const NEKO_ID = 'corgi-oneko';
const SPRITE_PATH = '/sprites/oneko.gif';
const STORAGE_KEY = 'corgi-oneko-pos';

type SpriteSet = [number, number][];
const SPRITE_SETS: Record<string, SpriteSet> = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  scratchSelf: [[-5, 0], [-6, 0], [-7, 0]],
  scratchWallN: [[0, 0], [0, -1]],
  scratchWallS: [[-7, -1], [-6, -2]],
  scratchWallE: [[-2, -2], [-2, -3]],
  scratchWallW: [[-4, 0], [-4, -1]],
  tired: [[-3, -2]],
  sleeping: [[-2, 0], [-2, -1]],
  N: [[-1, -2], [-1, -3]],
  NE: [[0, -2], [0, -3]],
  E: [[-3, 0], [-3, -1]],
  SE: [[-5, -1], [-5, -2]],
  S: [[-6, -3], [-7, -2]],
  SW: [[-5, -3], [-6, -1]],
  W: [[-4, -2], [-4, -3]],
  NW: [[-1, 0], [-1, -1]],
};

const NEKO_SPEED = 10;
const FRAME_INTERVAL = 100;

interface NekoPosition {
  x: number;
  y: number;
}

function loadPosition(): NekoPosition | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
      return { x: parsed.x, y: parsed.y };
    }
  } catch {}
  return undefined;
}

function persistPosition(x: number, y: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ x: Math.round(x), y: Math.round(y) }));
  } catch {}
}

function createNeko(spriteUrl: string, initialPos?: NekoPosition): {
  destroy: () => void;
} {
  let nekoPosX = initialPos?.x ?? 32;
  let nekoPosY = initialPos?.y ?? 32;
  // Initialize mouse position to neko position so it doesn't run to (0,0) on load
  let mousePosX = nekoPosX;
  let mousePosY = nekoPosY;
  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation: string | null = null;
  let idleAnimationFrame = 0;
  let lastFrameTimestamp = 0;

  const el = document.createElement('div');
  el.id = NEKO_ID;
  el.ariaHidden = 'true';
  el.style.cssText = [
    'width: 32px',
    'height: 32px',
    'position: fixed',
    'pointer-events: none',
    'image-rendering: pixelated',
    `left: ${nekoPosX - 16}px`,
    `top: ${nekoPosY - 16}px`,
    'z-index: 2147483647',
    `background-image: url(${spriteUrl})`,
  ].join(';');

  document.body.appendChild(el);

  function setSprite(name: string, frame: number): void {
    const set = SPRITE_SETS[name];
    if (!set) return;
    const sprite = set[frame % set.length];
    el.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function idle(): void {
    idleTime += 1;

    if (idleTime > 10 && Math.floor(Math.random() * 200) === 0 && !idleAnimation) {
      const options = ['sleeping', 'scratchSelf'];
      idleAnimation = options[Math.floor(Math.random() * options.length)];
      idleAnimationFrame = 0;
    }

    if (idleAnimation) {
      setSprite(idleAnimation, idleAnimationFrame);
      if (idleAnimation === 'sleeping') {
        if (idleAnimationFrame > 192) {
          setSprite('tired', 0);
        } else {
          idleAnimationFrame++;
        }
      } else {
        idleAnimationFrame++;
        if (idleAnimationFrame > 9) {
          idleAnimation = null;
          idleAnimationFrame = 0;
        }
      }
      return;
    }

    setSprite('idle', 0);
  }

  function frame(): void {
    frameCount++;

    const diffX = nekoPosX - mousePosX;
    const diffY = nekoPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < NEKO_SPEED || distance < 48) {
      idle();
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    if (idleTime > 1) {
      setSprite('alert', 0);
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    idleTime = 0;

    let direction = '';
    direction += diffY / distance > 0.5 ? 'N' : '';
    direction += diffY / distance < -0.5 ? 'S' : '';
    direction += diffX / distance > 0.5 ? 'W' : '';
    direction += diffX / distance < -0.5 ? 'E' : '';

    if (direction) {
      setSprite(direction, frameCount);
    }

    nekoPosX -= (diffX / distance) * NEKO_SPEED;
    nekoPosY -= (diffY / distance) * NEKO_SPEED;
    nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
    nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);

    el.style.left = `${nekoPosX - 16}px`;
    el.style.top = `${nekoPosY - 16}px`;
  }

  function onAnimationFrame(timestamp: number): void {
    if (!el.isConnected) return;
    if (!lastFrameTimestamp) lastFrameTimestamp = timestamp;
    if (timestamp - lastFrameTimestamp > FRAME_INTERVAL) {
      lastFrameTimestamp = timestamp;
      frame();
    }
    window.requestAnimationFrame(onAnimationFrame);
  }

  const onMouseMove = (e: MouseEvent): void => {
    mousePosX = e.clientX;
    mousePosY = e.clientY;
  };

  const onBeforeUnload = (): void => {
    persistPosition(nekoPosX, nekoPosY);
  };

  document.addEventListener('mousemove', onMouseMove);
  window.addEventListener('beforeunload', onBeforeUnload);
  window.requestAnimationFrame(onAnimationFrame);

  return {
    destroy() {
      persistPosition(nekoPosX, nekoPosY);
      el.remove();
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('beforeunload', onBeforeUnload);
    },
  };
}

export const onekoPlugin = definePlugin({
  name: 'oneko',
  displayName: 'Oneko (Cat)',
  version: '0.4.0',
  authors: ['adryd325', 'aluminyoom'],
  description: 'A cute cat that follows your mouse cursor around the page',
  defaultEnabled: false,

  async onStart() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const spriteUrl = await bridgeRequest<string>('runtime:getURL', { path: SPRITE_PATH });

    const initialPos = loadPosition();

    const neko = createNeko(spriteUrl, initialPos);
    return () => neko.destroy();
  },
});
