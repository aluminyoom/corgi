export type BeforeHook<T extends unknown[] = unknown[]> = (...args: T) => T | void;
export type AfterHook<R = unknown> = (result: R) => R | void;
export type ReplacementHook<T extends unknown[] = unknown[], R = unknown> = (
  original: (...args: T) => R,
  ...args: T
) => R;

interface WrapOptions<T extends unknown[] = unknown[], R = unknown> {
  before?: BeforeHook<T>;
  after?: AfterHook<R>;
  replace?: ReplacementHook<T, R>;
}

const wrappedFunctions = new Map<string, { original: Function; restore: () => void }>();

export function wrapFunction<T extends unknown[] = unknown[], R = unknown>(
  target: Record<string, unknown>,
  methodName: string,
  options: WrapOptions<T, R>,
): () => void {
  const original = target[methodName] as (...args: T) => R;
  if (typeof original !== 'function') {
    return () => {};
  }

  const key = `${String(target.constructor?.name ?? 'obj')}.${methodName}`;

  const patched = function (this: unknown, ...args: T): R {
    let finalArgs = args;

    if (options.before) {
      const modified = options.before(...args);
      if (modified !== undefined) finalArgs = modified;
    }

    let result: R;
    if (options.replace) {
      result = options.replace(original.bind(this) as (...a: T) => R, ...finalArgs);
    } else {
      result = original.apply(this, finalArgs) as R;
    }

    if (options.after) {
      const modified = options.after(result);
      if (modified !== undefined) result = modified;
    }

    return result;
  };

  Object.defineProperty(patched, 'name', { value: original.name });
  Object.defineProperty(patched, 'length', { value: original.length });

  target[methodName] = patched;

  const restore = () => {
    if (target[methodName] === patched) {
      target[methodName] = original;
    }
    wrappedFunctions.delete(key);
  };

  wrappedFunctions.set(key, { original, restore });
  return restore;
}

export function wrapPrototypeMethod<T extends unknown[] = unknown[], R = unknown>(
  prototype: Record<string, unknown>,
  methodName: string,
  options: WrapOptions<T, R>,
): () => void {
  return wrapFunction(prototype, methodName, options);
}

export function restoreAll(): void {
  for (const [, entry] of wrappedFunctions) {
    entry.restore();
  }
  wrappedFunctions.clear();
}
