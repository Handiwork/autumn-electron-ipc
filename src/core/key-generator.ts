export interface IKeyGenerator<T> {
  next(): T;
}

export class KeyGenerator implements IKeyGenerator<number> {
  #current = 0;
  #max = Number.MAX_SAFE_INTEGER - 1;

  next() {
    this.#current = (this.#current + 1) % this.#max;
    return this.#current;
  }
}

export class StringKeyGenerotor implements IKeyGenerator<string> {
  #generator = new KeyGenerator();

  next() {
    return this.#generator.next().toString();
  }
}
