/**
 *  Type for Remote Proxy of {@link T}
 *
 *  @example
 *  const sample = {
 *    a: 1,
 *    b(k: number, s: string) {
 *      return undefined;
 *    },
 *    c: null,
 *    d: {
 *      e: (bb: BigInt) => true,
 *      f: 0.2,
 *    },
 *  };
 *  const proxy: RemoteProxy<typeof sample> = new Proxy<any>({}, {});
 *  proxy.d.$f; // Promise<number>
 */
export type RemoteProxy<T> = Resolver<T> &
  ProxyGetter<T> &
  RemoteFunctionGetter<T>;

/**
 * Resolvable properties set as getter.
 */
type Resolver<T> = {
  readonly [x in keyof T as $ResolvableKey<T, x>]: Promise<T[x]>;
};

/**
 * A Key whose corresponding value can be possibly transfered, start with '$'
 */
type $ResolvableKey<T, x extends keyof T> = T[x] extends AFunction | symbol
  ? never
  : `$${x & string}`;

/**
 * Getter for sub-proxies
 */
type ProxyGetter<T> = {
  readonly [x in keyof T as ObjectKey<T, x>]: RemoteProxy<T[x]>;
};

/**
 * Key of Object
 */
type ObjectKey<T, x extends keyof T> = T[x] extends Record<string, unknown>
  ? x
  : never;

/**
 * Getter for remote functions
 */
type RemoteFunctionGetter<T> = {
  readonly [x in keyof T as FunctionKey<T, x>]: RemoteFunction<T[x]>;
};

/**
 * Key of Function
 */
type FunctionKey<T, x extends keyof T> = T[x] extends AFunction ? x : never;

/**
 * Any function
 */
export type AFunction = TFunction<any, any>;

/**
 * Normal function
 */
export type TFunction<A extends any[], R> = (...args: A) => R;

/**
 * Remote form of function {@link F}
 */
type RemoteFunction<F> = F extends TFunction<infer A, infer R>
  ? TFunction<A, PromiseValue<R>>
  : never;

/**
 * Wrap value with {@link Promise}, no-op if already a promise
 */
export type PromiseValue<T> = T extends Promise<any> ? T : Promise<T>;

/**
 * Extract return type and wrap it with promise if neccessary
 */
export type PromiseReturnType<T extends AFunction> = PromiseValue<
  ReturnType<T>
>;

/**
 * Change to a function returnig promise if neccessary
 */
export type PromiseFunction<T extends AFunction> = TFunction<
  Parameters<T>,
  PromiseReturnType<T>
>;
