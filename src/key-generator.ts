export interface IKeyGenerator<T> {
  next(): T;
}

const MAX = Number.MAX_SAFE_INTEGER - 1;

export class KeyGenerator {
  #current = 0;

  next() {
    this.#current = (this.#current + 1) % MAX;
    return this.#current;
  }
}

export class StringKeyGenerotor implements IKeyGenerator<string> {
  #current = 0;

  next() {
    this.#current = (this.#current + 1) % MAX;
    return this.#current.toString();
  }
}
