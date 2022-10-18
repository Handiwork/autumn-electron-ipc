import { get, set, unset } from "lodash";
import { StringKeyGenerotor } from "./key-generator";

/**
 * A holder for anonymous objects
 */
export class ObjectHolder {
  #keyGenerator = new StringKeyGenerotor();
  #impl: any = {};
  #inversedMap = new Map<any, string>();

  /**
   * Gets the property value at path.
   * @param path The path of the property to get.
   * @returns The resolved value.
   */
  get(path: string) {
    return get(this.#impl, path);
  }

  /**
   * Mount property to this holder and return the generated key
   * @param target The property value
   * @returns The property key
   */
  hold(target: any): string {
    const held = this.#inversedMap.get(target);
    if (held) return held;
    const key = this.#keyGenerator.next();
    this.#inversedMap.set(target, key);
    set(this.#impl, key, target);
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
    set(this.#impl, path, target);
  }

  /**
   * Delete the property at path.
   * @param path The path of the property to delete
   * @returns Whether deleted.
   */
  delete(path: string) {
    const target = get(this.#impl, path);
    if (target) this.#inversedMap.delete(target);
    return unset(this.#impl, path);
  }

  /**
   * clear all reference to held objects.
   */
  clear() {
    this.#impl = {};
  }
}
