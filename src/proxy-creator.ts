import { WeakMapWithValueCreator } from "./holder";
import type ObjectPort from "./object-port";

export default class ProxyCreator extends WeakMapWithValueCreator<string, any> {
  constructor(private op: ObjectPort) {
    super(
      (path) => createProxy(op, path, this),
      () => undefined
    );
  }
}

export function createProxy(
  op: ObjectPort,
  path: string,
  cache: WeakMapWithValueCreator<string, any>
) {
  return new Proxy<any>(
    {},
    {
      get: (target, p: string) => {
        if (p.charAt(0) === "$") {
          return op.callResolve(`${path}.${p.slice(1)}`);
        } else {
          return cache.getOrCreate(`${path}.${p}`);
        }
      },
      apply: (target, thisArg, args: any[]) => {
        return op.callFunction(path, args);
      },
    }
  );
}
