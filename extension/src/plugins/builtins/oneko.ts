import { definePlugin } from "../api";
import { createSpriteFollower } from "@/ui/sprite-follower";

const SPRITE_PATH = "/sprites/oneko.gif";

type SpriteSet = [number, number][];
const SPRITE_SETS: Record<string, SpriteSet> = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  scratchSelf: [
    [-5, 0],
    [-6, 0],
    [-7, 0],
  ],
  scratchWallN: [
    [0, 0],
    [0, -1],
  ],
  scratchWallS: [
    [-7, -1],
    [-6, -2],
  ],
  scratchWallE: [
    [-2, -2],
    [-2, -3],
  ],
  scratchWallW: [
    [-4, 0],
    [-4, -1],
  ],
  tired: [[-3, -2]],
  sleeping: [
    [-2, 0],
    [-2, -1],
  ],
  N: [
    [-1, -2],
    [-1, -3],
  ],
  NE: [
    [0, -2],
    [0, -3],
  ],
  E: [
    [-3, 0],
    [-3, -1],
  ],
  SE: [
    [-5, -1],
    [-5, -2],
  ],
  S: [
    [-6, -3],
    [-7, -2],
  ],
  SW: [
    [-5, -3],
    [-6, -1],
  ],
  W: [
    [-4, -2],
    [-4, -3],
  ],
  NW: [
    [-1, 0],
    [-1, -1],
  ],
};

function nekoSetSprite(
  el: HTMLElement,
  direction: string,
  frame: number,
): void {
  const set = SPRITE_SETS[direction];
  if (!set) return;
  const sprite = set[frame % set.length];
  el.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
}

export const onekoPlugin = definePlugin({
  name: "oneko",
  displayName: "Oneko (Cat)",
  version: "0.5.0",
  authors: ["adryd325", "aluminyoom"],
  description: "A cute cat that follows your mouse cursor around the page",
  defaultEnabled: false,

  async onStart(api) {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reducedMotion) return;

    const spriteUrl = await api.getAssetURL(SPRITE_PATH);

    let idleTime = 0;
    let idleAnimation: string | null = null;
    let idleAnimationFrame = 0;

    const handle = await createSpriteFollower({
      id: "corgi-oneko",
      spriteUrl,
      spriteSize: 32,
      speed: 10,
      frameInterval: 100,
      storageKey: "corgi-oneko-pos",
      idleDistance: 48,
      setSprite: nekoSetSprite,
      onIdle(state) {
        idleTime += 1;

        if (
          idleTime > 10 &&
          Math.floor(Math.random() * 200) === 0 &&
          !idleAnimation
        ) {
          const options = ["sleeping", "scratchSelf"];
          idleAnimation = options[Math.floor(Math.random() * options.length)];
          idleAnimationFrame = 0;
        }

        if (idleAnimation) {
          nekoSetSprite(state.el, idleAnimation, idleAnimationFrame);
          if (idleAnimation === "sleeping") {
            if (idleAnimationFrame > 192) {
              nekoSetSprite(state.el, "tired", 0);
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

        nekoSetSprite(state.el, "idle", 0);
      },
      onFrame(state) {
        if (state.distance >= 48) {
          if (idleTime > 1) {
            nekoSetSprite(state.el, "alert", 0);
            idleTime = Math.min(idleTime, 7);
            idleTime -= 1;
          } else {
            idleTime = 0;
            idleAnimation = null;
            idleAnimationFrame = 0;
          }
        }
      },
    });

    return () => handle.destroy();
  },
});
