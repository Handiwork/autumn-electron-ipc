import type { Sender } from "./object-port";

function buildPath(base: string, target: string) {
  if (base === "") return target;
  return `${base}.${target}`;
}

/**
 * Manager for proxies. This manager is responsible for creating and weakly holding proxies.
 */
export class ProxyManager {
  constructor(private mainKey: string) {
    this.#registry = new FinalizationRegistry((key) => {
      if (!key.startsWith(mainKey)) this.sender.callRelease(key);
    });
  }
  sender: Sender;

  #createProxy(path: string) {
    return new Proxy<any>(Function, {
      get: (target, p: string) => {
        if (p.charAt(0) === "$") {
          return this.sender.callResolve(buildPath(path, p.slice(1)));
        } else {
          return this.getOrCreate(buildPath(path, p));
        }
      },
      apply: (target, thisArg, args: any[]) => {
        return this.sender.callFunction(path, args);
      },
    });
  }

  #map = new Map<string, WeakRef<any>>();

  #registry: FinalizationRegistry<string>;

  /**
   * Get or create object of this key
   * @param key Key of object
   * @returns Value that already exists or was newly created.
   */
  public getOrCreate(key: string): any {
    const ins = this.#map.get(key)?.deref();
    if (ins) return ins;

    const nIns = this.#createProxy(key);
    this.#map.set(key, new WeakRef(nIns));
    this.#registry.register(nIns, key);
    return nIns;
  }

  getDefault() {
    return this.getOrCreate(this.mainKey);
  }
}
