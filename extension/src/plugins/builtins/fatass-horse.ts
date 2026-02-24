import { definePlugin } from '../api';
import { createSpriteFollower } from '@/ui/sprite-follower';

const SPRITE_PATH = '/sprites/fatass-horse.png';
const SPRITE_SIZE = 120;
const COLS = 9;

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

export const fatassHorsePlugin = definePlugin({
  name: 'fatass-horse',
  displayName: 'Fatass Horse',
  version: '0.5.0',
  authors: ['nexpid', 'aluminyoom'],
  description: 'A fatass horse that follows your mouse cursor around the page',
  defaultEnabled: false,

  async onStart(api) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const spriteUrl = await api.getAssetURL(SPRITE_PATH);

    let opacity = 1;

    const handle = await createSpriteFollower({
      id: 'corgi-fatass-horse',
      spriteUrl,
      spriteSize: SPRITE_SIZE,
      speed: 30,
      frameInterval: 42,
      storageKey: 'corgi-horse-pos',
      idleDistance: SPRITE_SIZE * 0.4,
      extraStyle: `background-size:${COLS * SPRITE_SIZE}px ${8 * SPRITE_SIZE}px;`,
      setSprite(el, direction, frame) {
        const row = DIRECTIONS[direction] ?? DIRECTIONS['S'];
        const col = frame % COLS;
        el.style.backgroundPosition = `${-col * SPRITE_SIZE}px ${-row * SPRITE_SIZE}px`;
      },
      onIdle(state) {
        const row = DIRECTIONS['S'];
        state.el.style.backgroundPosition = `0px ${-row * SPRITE_SIZE}px`;
      },
      onFrame(state) {
        const nearCursor = state.distance < SPRITE_SIZE * 0.6;
        const targetOpacity = nearCursor ? 0.3 : 1;
        opacity += (targetOpacity - opacity) * 0.1;
        state.el.style.opacity = String(Math.round(opacity * 100) / 100);
      },
    });

    return () => handle.destroy();
  },
});
