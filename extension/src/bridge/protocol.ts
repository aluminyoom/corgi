export const BRIDGE_SOURCE = 'corgi-bridge' as const;

export type BridgeAction =
  | 'storage:get'
  | 'storage:set'
  | 'storage:watch'
  | 'storage:unwatch'
  | 'runtime:send'
  | 'theme:apply'
  | 'theme:clear'
  | 'plugin:list'
  | 'plugin:state'
  | 'ready';

export interface BridgeRequest {
  source: typeof BRIDGE_SOURCE;
  direction: 'main-to-isolated';
  id: string;
  action: BridgeAction;
  payload?: unknown;
}

export interface BridgeResponse {
  source: typeof BRIDGE_SOURCE;
  direction: 'isolated-to-main';
  id: string;
  ok: boolean;
  data?: unknown;
  error?: string;
}

export interface BridgePush {
  source: typeof BRIDGE_SOURCE;
  direction: 'isolated-to-main';
  id: null;
  action: BridgeAction;
  payload?: unknown;
}

export type BridgeMessage = BridgeRequest | BridgeResponse | BridgePush;

export function isBridgeRequest(event: MessageEvent): event is MessageEvent<BridgeRequest> {
  return (
    event.data?.source === BRIDGE_SOURCE &&
    event.data?.direction === 'main-to-isolated' &&
    typeof event.data?.id === 'string'
  );
}

export function isBridgeResponse(event: MessageEvent): event is MessageEvent<BridgeResponse> {
  return (
    event.data?.source === BRIDGE_SOURCE &&
    event.data?.direction === 'isolated-to-main' &&
    typeof event.data?.id === 'string'
  );
}

export function isBridgePush(event: MessageEvent): event is MessageEvent<BridgePush> {
  return (
    event.data?.source === BRIDGE_SOURCE &&
    event.data?.direction === 'isolated-to-main' &&
    event.data?.id === null
  );
}
