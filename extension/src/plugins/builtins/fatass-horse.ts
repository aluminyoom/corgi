import { definePlugin } from '../api';
import { bridgeRequest } from '@/bridge/main-side';

const HORSE_ID = 'corgi-fatass-horse';
const SPRITE_PATH = '/sprites/fatass-horse.png';
const SPRITE_SIZE = 120;
const COLS = 9;
const ROWS = 8;

const HORSE_SPEED = 30;
const FRAME_INTERVAL = 42;
const STORAGE_KEY = 'corgi-horse-pos';

const DIRECTIONS: Record<string, number> = {
  N: 0,
  NE: 1,
  E: 2,
  SE: 3,
  S: 4,
  SW: 5,
  W: 6,
  NW: 7,
};

interface HorsePosition {
  x: number;
  y: number;
}

function loadPosition(): HorsePosition | undefined {
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

function waitForBody(): Promise<HTMLElement> {
  return new Promise((resolve) => {
    if (document.body) return resolve(document.body);
    const obs = new MutationObserver(() => {
      if (document.body) {
        obs.disconnect();
        resolve(document.body);
      }
    });
    obs.observe(document.documentElement, { childList: true });
  });
}

function createHorse(spriteUrl: string, initialPos?: HorsePosition): {
  destroy: () => void;
} {
  let posX = initialPos?.x ?? 64;
  let posY = initialPos?.y ?? 64;
  // Initialize mouse position to horse position so it doesn't run to (0,0) on load
  let mousePosX = posX;
  let mousePosY = posY;
  let frameCount = 0;
  let lastFrameTimestamp = 0;
  let opacity = 1;

  const el = document.createElement('div');
  el.id = HORSE_ID;
  el.ariaHidden = 'true';
  el.style.cssText = [
    `width: ${SPRITE_SIZE}px`,
    `height: ${SPRITE_SIZE}px`,
    'position: fixed',
    'pointer-events: none',
    `left: ${posX - SPRITE_SIZE / 2}px`,
    `top: ${posY - SPRITE_SIZE / 2}px`,
    'z-index: 2147483647',
    `background-image: url(${spriteUrl})`,
    `background-size: ${COLS * SPRITE_SIZE}px ${ROWS * SPRITE_SIZE}px`,
  ].join(';');

  waitForBody().then((body) => body.appendChild(el));

  function setSprite(row: number, col: number): void {
    el.style.backgroundPosition = `${-col * SPRITE_SIZE}px ${-row * SPRITE_SIZE}px`;
  }

  function frame(): void {
    frameCount++;

    const diffX = posX - mousePosX;
    const diffY = posY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    const nearCursor = distance < SPRITE_SIZE * 0.6;
    const targetOpacity = nearCursor ? 0.3 : 1;
    opacity += (targetOpacity - opacity) * 0.1;
    el.style.opacity = String(Math.round(opacity * 100) / 100);

    if (distance < HORSE_SPEED || distance < SPRITE_SIZE * 0.4) {
      setSprite(DIRECTIONS['S'], 0);
      return;
    }

    let direction = '';
    direction += diffY / distance > 0.5 ? 'N' : '';
    direction += diffY / distance < -0.5 ? 'S' : '';
    direction += diffX / distance > 0.5 ? 'W' : '';
    direction += diffX / distance < -0.5 ? 'E' : '';

    const row = DIRECTIONS[direction] ?? DIRECTIONS['S'];
    const col = frameCount % COLS;
    setSprite(row, col);

    posX -= (diffX / distance) * HORSE_SPEED;
    posY -= (diffY / distance) * HORSE_SPEED;
    posX = Math.min(Math.max(SPRITE_SIZE / 2, posX), window.innerWidth - SPRITE_SIZE / 2);
    posY = Math.min(Math.max(SPRITE_SIZE / 2, posY), window.innerHeight - SPRITE_SIZE / 2);

    el.style.left = `${posX - SPRITE_SIZE / 2}px`;
    el.style.top = `${posY - SPRITE_SIZE / 2}px`;
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
    persistPosition(posX, posY);
  };

  document.addEventListener('mousemove', onMouseMove);
  window.addEventListener('beforeunload', onBeforeUnload);
  window.requestAnimationFrame(onAnimationFrame);

  return {
    destroy() {
      persistPosition(posX, posY);
      el.remove();
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('beforeunload', onBeforeUnload);
    },
  };
}

export const fatassHorsePlugin = definePlugin({
  name: 'fatass-horse',
  displayName: 'Fatass Horse',
  version: '0.4.0',
  authors: ['nexpid', 'aluminyoom'],
  description: 'A fatass horse that follows your mouse cursor around the page',
  defaultEnabled: false,

  async onStart() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const spriteUrl = await bridgeRequest<string>('runtime:getURL', { path: SPRITE_PATH });

    const saved = loadPosition();
    const initialPos: HorsePosition | undefined =
      saved?.x != null && saved?.y != null
        ? { x: saved.x, y: saved.y }
        : undefined;

    const horse = createHorse(spriteUrl, initialPos);
    return () => horse.destroy();
  },
});
