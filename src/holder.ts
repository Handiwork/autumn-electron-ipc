import type { IKeyGenerator } from "./promise-manager";

/**
 * A Map that holds weak reference to objects of type {@link V}.
 *
 * A new object will be created by the creator if the key does not exist.
 * The finalization callback will be called when a weak-referenced object is reclaimed.
 */
export class WeakMapWithValueCreator<K, V extends object> {
  /**
   * Create a WeakHolder
   * @param create Creator for new {@link V} for key of Type {@link K}.
   * @param finalization Callback that will be called when a weak-referenced object is reclaimed.
   */
  constructor(private create: (key: K) => V, finalization: (key: K) => void) {
    this.registry = new FinalizationRegistry(finalization);
  }
  private map = new Map<K, WeakRef<V>>();
  private registry: FinalizationRegistry<K>;

  /**
   * Get or create object of this key
   * @param key Key of object
   * @returns Value that already exists or was newly created.
   */
  public getOrCreate(key: K): V {
    const ins = this.map.get(key)?.deref();
    if (ins) return ins;

    const nIns = this.create(key);
    this.map.set(key, new WeakRef(nIns));
    this.registry.register(nIns, key);
    return nIns;
  }
}

/**
 * A Map that holds strong reference to objects of type {@link V}.
 *
 * A new key will be generated if an object is not stored.
 */
export class StrongMapWithKeyCreator<K, V> {
  constructor(private keyGenerator: IKeyGenerator<K>) {}
  private back = new Map<K, V>();
  private forward = new Map<V, K>();

  /**
   * Add target to this holder and return the key (newly created or already existing)
   * @param obj The object will be held
   * @returns The key
   */
  public put(obj: any): K {
    let key = this.forward.get(obj);
    if (key) return key;

    key = this.keyGenerator.next();
    this.back.set(key, obj);
    this.forward.set(obj, key);
    return key;
  }

  /**
   * Get object of key
   * @param key Object key
   * @returns Required Object
   * @throws Error if not exists
   */
  public get(key: K) {
    const obj = this.back.get(key);
    if (!obj) throw new Error(`key ${key} does not exist`);
    return obj;
  }

  /**
   * Delete object of key
   * @param key Object key
   * @throws Error if not exists
   */
  public delete(key: K) {
    const obj = this.get(key);
    this.back.delete(key);
    this.forward.delete(obj);
  }

  public clear() {
    this.forward.clear();
    this.back.clear();
  }
}
