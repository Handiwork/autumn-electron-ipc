/**
 *  Remote Proxy Type of {@link T}
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
  [x in keyof T as ObjectKey<T, x>]: RemoteProxy<T[x]>;
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
  ? TFunction<RemoteFormArgs<A>, PromiseValue<R>>
  : never;

/**
 * Remote form of {@link Args}
 */
type RemoteFormArgs<Args extends any[]> = [
  ...{
    [x in keyof Args]: Args[x] extends AFunction
      ? RemoteCallback<Args[x]>
      : Args[x];
  }
];

/**
 * Callback in a remote form.
 *
 * Top level arguments will be transferred according to the following rules:
 *
 * - Supported types are transferrd in their positions offset by 1, like number;
 * - Non-supported types are supported as {@link Proxy}, like functions;
 * - Object types are transferred as proxies;
 *
 * {@link Proxy} at postion 0 can be used to resolve all arguments in a remote form.
 */
export type RemoteCallback<T> = T extends TFunction<infer A, infer R>
  ? (...args: [RemoteProxy<A>, ...RemoteCallbackArgs<A>]) => PromiseValue<R>
  : never;

/**
 * Callback form of {@link Args}
 */
export type RemoteCallbackArgs<Args extends any[]> = [
  ...{
    [x in keyof Args]: Args[x] extends AFunction
      ? RemoteFunction<Args[x]>
      : Args[x];
  }
];

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
