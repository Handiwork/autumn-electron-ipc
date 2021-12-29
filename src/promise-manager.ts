type TPromise = {
  resolve: (v: any) => void;
  reject: (e: any) => void;
};

/**
 * PromiseManger in charge of creating and resolving {@link Promise}s
 */
export default class PromiseManager {
  constructor(
    private keyGenerator: IKeyGenerator<number> = new KeyGenerator()
  ) {}

  private pendingPromises = new Map<number, TPromise>();

  createPromise(init: (key: number) => void) {
    return new Promise((resolve, reject) => {
      const key = this.keyGenerator.next();
      init(key);
      this.pendingPromises.set(key, { resolve, reject });
    });
  }

  completePromise(key: number, err: any, data: any) {
    const promise = this.pendingPromises.get(key);
    if (!promise) return;
    if (err) promise.reject(err);
    else promise.resolve(data);
  }
}

export interface IKeyGenerator<T> {
  next(): T;
}

export class KeyGenerator {
  private current = 0;
  next() {
    this.current = (this.current + 1) % Number.MAX_SAFE_INTEGER;
    return this.current;
  }
}

export class StringKeyGenerotor implements IKeyGenerator<string> {
  private current = 0;
  next() {
    this.current = (this.current + 1) % Number.MAX_SAFE_INTEGER;
    return this.current.toString();
  }
}
