import { get, set, unset } from "lodash";
import { StringKeyGenerotor } from "./promise-manager";

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
  constructor(
    private create: (key: K) => V,
    private finalization: (key: K) => void
  ) {}
  private map = new Map<K, WeakRef<V>>();
  /**
   * Internal interval. It is of type any because it's different from node to browser
   */
  private interval: any;

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
    return nIns;
  }

  public tryGC = () => {
    for (const [k, v] of this.map) {
      if (v.deref() === null) {
        this.finalization?.call(k);
      }
    }
  };

  /**
   * Start continously garbage collecting.
   */
  public startCGC() {
    this.stopCGC();
    this.interval = setInterval(this.tryGC, 5000);
  }

  /**
   * Stop continously garbage collecting.
   */
  public stopCGC() {
    const timer = this.interval;
    if (timer) clearInterval(timer);
  }
}

/**
 * A holder for anonymous objects
 */
export class ObjectHolder {
  private keyGenerator = new StringKeyGenerotor();
  private impl: any = {};

  /**
   * Gets the property value at path.
   * @param path The path of the property to get.
   * @returns The resolved value.
   */
  get(path: string) {
    return get(this.impl, path);
  }

  /**
   * Mount property to this holder and return the generated key
   * @param target The property value
   * @returns The property key
   */
  post(target: any) {
    const key = this.keyGenerator.next();
    set(this.impl, key, target);
    return key;
  }

  /**
   * Sets the value at path of object. If a portion of path doesn’t exist it’s created.
   * Arrays are created for missing index properties while objects are created for all
   * other missing properties.
   * @param path The path of the property to set.
   * @param target The value to set.
   */
  put(path: string, target: any) {
    set(this.impl, path, target);
  }

  /**
   * Delete the property at path.
   * @param path The path of the property to delete
   * @returns Whether deleted.
   */
  delete(path: string) {
    return unset(this.impl, path);
  }

  /**
   * clear all reference to held objects.
   */
  clear() {
    this.impl = {};
  }
}
