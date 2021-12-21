// Normal Types
type TFunction<A extends any[], R> = (...args: A) => R;

type Promisify<T> = T extends TFunction<any, any>
  ? never
  : T extends symbol
  ? never
  : Promise<T>;

type ObjectProxy<T> = {
  [x in keyof T as `$${string & x}`]: Promisify<T[x]>;
} & {
  [x in keyof T]: RemoteProxy<T[x]>;
};

export type RemoteProxy<T> = T extends TFunction<infer A, Promise<infer R>>
  ? TFunction<A, Promise<R>>
  : T extends TFunction<infer A, infer R>
  ? TFunction<A, Promise<R>>
  : ObjectProxy<T>;
