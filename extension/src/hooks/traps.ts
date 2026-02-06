type TrapCallback<T> = (value: T) => void;

interface TrapEntry<T = unknown> {
  callbacks: Set<TrapCallback<T>>;
  captured: boolean;
  value: T | undefined;
  descriptor: PropertyDescriptor | undefined;
}

const traps = new Map<string, TrapEntry>();

export function trapGlobal<T>(
  property: string,
  callback: TrapCallback<T>,
): () => void {
  let entry = traps.get(property) as TrapEntry<T> | undefined;

  if (!entry) {
    const existing = Object.getOwnPropertyDescriptor(window, property);
    entry = {
      callbacks: new Set(),
      captured: existing !== undefined,
      value: existing?.value as T | undefined,
      descriptor: existing,
    };
    traps.set(property, entry as TrapEntry);

    if (entry.captured && entry.value !== undefined) {
      // value already set before our trap, fire immediately
    } else {
      let stored = entry.value;
      Object.defineProperty(window, property, {
        configurable: true,
        enumerable: true,
        get() {
          return stored;
        },
        set(val: T) {
          stored = val;
          entry!.value = val;
          entry!.captured = true;
          for (const cb of entry!.callbacks) {
            try {
              cb(val);
            } catch {
              // trap listeners should not crash page
            }
          }
        },
      });
    }
  }

  entry.callbacks.add(callback);

  if (entry.captured && entry.value !== undefined) {
    try {
      callback(entry.value);
    } catch {
      // same safety
    }
  }

  return () => {
    entry!.callbacks.delete(callback);
    if (entry!.callbacks.size === 0) {
      traps.delete(property);
      if (entry!.descriptor) {
        Object.defineProperty(window, property, entry!.descriptor);
      } else if (entry!.captured) {
        Object.defineProperty(window, property, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: entry!.value,
        });
      }
    }
  };
}
