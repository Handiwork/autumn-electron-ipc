import type { IKeyGenerator } from "./key-generator";
import { KeyGenerator } from "./key-generator";

export type TPromise = {
  resolve: (v: any) => void;
  reject: (e: any) => void;
};

/**
 * PromiseManger in charge of creating and resolving {@link Promise}s
 */
export class PromiseManager {
  constructor(
    private keyGenerator: IKeyGenerator<number> = new KeyGenerator()
  ) {}

  private pendingPromises = new Map<number, TPromise>();

  createPromise(init: (key: number) => void) {
    return new Promise((resolve, reject) => {
      const key = this.keyGenerator.next();
      this.pendingPromises.set(key, { resolve, reject });
      init(key);
    });
  }

  completePromise(key: number, err: any, data: any) {
    const promise = this.pendingPromises.get(key);
    if (!promise) return;
    this.pendingPromises.delete(key);
    if (err) promise.reject(err);
    else promise.resolve(data);
  }

  rejectAll() {
    Array.from(this.pendingPromises.keys()).forEach((k) =>
      this.completePromise(k, "abandoned", undefined)
    );
  }
}
