// Normal Types
export type TFunction<A extends any[], R> = (...args: A) => R;
// Any Function
export type AFunction = TFunction<any, any>;

/**
 * A Key whose corresponding value can be possibly transfered
 */
type ResolvableKey<T, x extends keyof T> = T[x] extends AFunction | symbol
  ? never
  : `$${string & x}`;

/**
 * Key of Function
 */
type FunctionKey<T, x extends keyof T> = T[x] extends AFunction ? x : never;

/**
 * Key of Object
 */
type ObjectKey<T, x extends keyof T> = T[x] extends Record<string, unknown>
  ? x
  : never;

/**
 * Remote Function of function {@link T}
 */
type RemoteFunction<T> = T extends TFunction<any, Promise<any>>
  ? T
  : T extends TFunction<infer A, infer R>
  ? TFunction<A, Promise<R>>
  : never;

/**
 *  Remote Proxy Type of {@link T}
 */
export type RemoteProxy<T> = {
  readonly [x in keyof T as ResolvableKey<T, x>]: Promise<T[x]>;
} & {
  [x in keyof T as ObjectKey<T, x>]: RemoteProxy<T[x]>;
} & {
  readonly [x in keyof T as FunctionKey<T, x>]: RemoteFunction<T[x]>;
};
