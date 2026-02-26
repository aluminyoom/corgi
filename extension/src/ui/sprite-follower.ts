import { waitForBody } from '@/utils/dom';

/** Configuration for creating a sprite follower. */
export interface SpriteFollowerConfig {
  /** DOM element ID. */
  id: string;
  /** URL of the sprite sheet image. */
  spriteUrl: string;
  /** Size of one sprite frame in px. */
  spriteSize: number;
  /** Movement speed in px/frame. */
  speed: number;
  /** Milliseconds between animation frames. */
  frameInterval: number;
  /** localStorage key for position persistence. */
  storageKey: string;
  /** Render the sprite for a given direction and frame index. */
  setSprite: (el: HTMLElement, direction: string, frame: number) => void;
  /** Called every animation frame. */
  onFrame?: (state: SpriteFollowerState) => void;
  /** Called when the sprite is within idle distance of the cursor. */
  onIdle?: (state: SpriteFollowerState) => void;
  /** Distance threshold for idle — defaults to speed. */
  idleDistance?: number;
  /** Extra CSS text appended to the element's style. */
  extraStyle?: string;
}

/** Snapshot of the follower's state passed to callbacks. */
export interface SpriteFollowerState {
  el: HTMLElement;
  posX: number;
  posY: number;
  mousePosX: number;
  mousePosY: number;
  frameCount: number;
  distance: number;
  diffX: number;
  diffY: number;
  direction: string;
}

/** Handle returned by `createSpriteFollower` for cleanup. */
export interface SpriteFollowerHandle {
  destroy: () => void;
}

function loadPosition(storageKey: string): { x: number; y: number } | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { x: unknown; y: unknown };
    if (
      typeof parsed.x === 'number' &&
      Number.isFinite(parsed.x) &&
      typeof parsed.y === 'number' &&
      Number.isFinite(parsed.y)
    ) {
      const x = Math.min(Math.max(parsed.x, 0), window.innerWidth);
      const y = Math.min(Math.max(parsed.y, 0), window.innerHeight);
      return { x, y };
    }
  } catch {
    /* ignore corrupt data */
  }
  return null;
}

function persistPosition(storageKey: string, x: number, y: number): void {
  localStorage.setItem(storageKey, JSON.stringify({ x, y }));
}

function computeDirection(diffX: number, diffY: number, distance: number): string {
  if (distance === 0) return 'S';
  let dir = '';
  if (diffY / distance > 0.5) dir += 'N';
  else if (diffY / distance < -0.5) dir += 'S';
  if (diffX / distance > 0.5) dir += 'W';
  else if (diffX / distance < -0.5) dir += 'E';
  return dir || 'S';
}

export async function createSpriteFollower(
  config: SpriteFollowerConfig,
): Promise<SpriteFollowerHandle> {
  const {
    id,
    spriteUrl,
    spriteSize,
    speed,
    frameInterval,
    storageKey,
    setSprite,
    onFrame,
    onIdle,
    extraStyle,
  } = config;
  const idleDistance = config.idleDistance ?? speed;

  await waitForBody();

  const el = document.createElement('div');
  el.id = id;
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText =
    `position:fixed;pointer-events:none;z-index:2147483647;` +
    `width:${spriteSize}px;height:${spriteSize}px;` +
    `image-rendering:pixelated;background-image:url(${spriteUrl});` +
    `top:0;left:0;` +
    (extraStyle ?? '');
  document.body.appendChild(el);

  const saved = loadPosition(storageKey);
  let posX = saved?.x ?? window.innerWidth / 2;
  let posY = saved?.y ?? window.innerHeight / 2;
  let mousePosX = posX;
  let mousePosY = posY;
  let frameCount = 0;
  let lastFrameTime = 0;
  let animId = 0;
  let destroyed = false;

  el.style.left = `${posX - spriteSize / 2}px`;
  el.style.top = `${posY - spriteSize / 2}px`;

  const onMouseMove = (e: MouseEvent) => {
    mousePosX = e.clientX;
    mousePosY = e.clientY;
  };
  document.addEventListener('mousemove', onMouseMove);

  const onBeforeUnload = () => {
    persistPosition(storageKey, posX, posY);
  };
  window.addEventListener('beforeunload', onBeforeUnload);

  function tick(timestamp: number) {
    if (destroyed) return;

    if (timestamp - lastFrameTime < frameInterval) {
      animId = requestAnimationFrame(tick);
      return;
    }
    lastFrameTime = timestamp;
    frameCount++;

    const diffX = posX - mousePosX;
    const diffY = posY - mousePosY;
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);
    const direction = computeDirection(diffX, diffY, distance);

    const state: SpriteFollowerState = {
      el,
      posX,
      posY,
      mousePosX,
      mousePosY,
      frameCount,
      distance,
      diffX,
      diffY,
      direction,
    };

    if (distance <= idleDistance) {
      onIdle?.(state);
    } else {
      posX -= (diffX / distance) * speed;
      posY -= (diffY / distance) * speed;

      posX = Math.max(0, Math.min(window.innerWidth - spriteSize, posX));
      posY = Math.max(0, Math.min(window.innerHeight - spriteSize, posY));

      setSprite(el, direction, frameCount);
    }

    onFrame?.(state);

    el.style.left = `${posX - spriteSize / 2}px`;
    el.style.top = `${posY - spriteSize / 2}px`;

    animId = requestAnimationFrame(tick);
  }

  animId = requestAnimationFrame(tick);

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimationFrame(animId);
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('beforeunload', onBeforeUnload);
      persistPosition(storageKey, posX, posY);
      el.remove();
    },
  };
}
