import { WeakMapWithValueCreator } from "./holder";
import type ObjectPort from "./object-port";

export default class ProxyManager extends WeakMapWithValueCreator<string, any> {
  constructor(op: ObjectPort) {
    super(
      (path) => createProxy(op, path, this),
      (key) => op.callRelease(key)
    );
  }
}

export function createProxy(
  op: ObjectPort,
  root: string,
  cache: WeakMapWithValueCreator<string, any>
) {
  function propertyPath(sub: string) {
    if (root === "") return sub;
    return `${root}.${sub}`;
  }
  return new Proxy<any>(Function, {
    get: (target, p: string) => {
      if (p.charAt(0) === "$") {
        return op.callResolve(propertyPath(p.slice(1)));
      } else {
        return cache.getOrCreate(propertyPath(p));
      }
    },
    apply: (target, thisArg, args: any[]) => {
      return op.callFunction(root, args);
    },
  });
}
