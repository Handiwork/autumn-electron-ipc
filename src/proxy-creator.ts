import { WeakMapWithValueCreator } from "./holder";
import type ObjectPort from "./object-port";

export default class ProxyCreator extends WeakMapWithValueCreator<string, any> {
  constructor(op: ObjectPort) {
    super(
      (path) => createProxy(op, path, this),
      () => undefined
    );
  }
}

const PROXY_PROTO = () => undefined;

export function createProxy(
  op: ObjectPort,
  root: string,
  cache: WeakMapWithValueCreator<string, any>
) {
  function propertyPath(sub: string) {
    if (root === "") return sub;
    return `${root}.${sub}`;
  }
  return new Proxy<any>(PROXY_PROTO, {
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
