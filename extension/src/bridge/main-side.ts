import {
  BRIDGE_SOURCE,
  type BridgeAction,
  type BridgeRequest,
  isBridgeResponse,
  isBridgePush,
} from "./protocol";

type PendingRequest = {
  resolve: (data: unknown) => void;
  reject: (error: Error) => void;
};

const pending = new Map<string, PendingRequest>();
const pushListeners = new Map<BridgeAction, Set<(payload: unknown) => void>>();
const queuedPushes: { action: BridgeAction; payload: unknown }[] = [];
let requestCounter = 0;

function generateId(): string {
  return `k-${++requestCounter}-${Date.now().toString(36)}`;
}

window.addEventListener("message", (event) => {
  if (event.source !== window) return;

  if (isBridgeResponse(event)) {
    const handler = pending.get(event.data.id);
    if (!handler) return;
    pending.delete(event.data.id);

    if (event.data.ok) {
      handler.resolve(event.data.data);
    } else {
      handler.reject(new Error(event.data.error ?? "bridge request failed"));
    }
    return;
  }

  if (isBridgePush(event)) {
    const listeners = pushListeners.get(event.data.action);
    if (!listeners || listeners.size === 0) {
      queuedPushes.push({
        action: event.data.action,
        payload: event.data.payload,
      });
      return;
    }
    for (const fn of listeners) {
      try {
        fn(event.data.payload);
      } catch {
        // plugin listeners should not crash the bridge
      }
    }
  }
});

export function bridgeRequest<T = unknown>(
  action: BridgeAction,
  payload?: unknown,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = generateId();
    pending.set(id, { resolve: resolve as (data: unknown) => void, reject });

    const message: BridgeRequest = {
      source: BRIDGE_SOURCE,
      direction: "main-to-isolated",
      id,
      action,
      payload,
    };

    window.postMessage(message, "*");

    setTimeout(() => {
      if (pending.has(id)) {
        pending.delete(id);
        reject(new Error(`bridge timeout: ${action}`));
      }
    }, 5000);
  });
}

export function onBridgePush(
  action: BridgeAction,
  fn: (payload: unknown) => void,
): () => void {
  let set = pushListeners.get(action);
  if (!set) {
    set = new Set();
    pushListeners.set(action, set);
  }
  set.add(fn);

  const replay = queuedPushes.filter((q) => q.action === action);
  for (let i = queuedPushes.length - 1; i >= 0; i--) {
    if (queuedPushes[i].action === action) queuedPushes.splice(i, 1);
  }
  for (const queued of replay) {
    try {
      fn(queued.payload);
    } catch {}
  }

  return () => set!.delete(fn);
}
