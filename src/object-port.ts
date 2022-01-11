import get from "lodash.get";
import { StrongMapWithKeyCreator, WeakMapWithValueCreator } from "./holder";
import PromiseManager, { StringKeyGenerotor } from "./promise-manager";
import type {
  FunctionRequest,
  GPort,
  Message,
  ReleaseRequest,
  ResolveRequest,
  SerializedArgs,
} from "./protocol";
import { createProxy } from "./proxy-creator";

export default class ObjectPort {
  constructor(private port: GPort) {
    this.proxyHolder = new TmpProxyCreator(this);
    port.on("message", this.dispatch);
  }

  /**
   * Proxy manager for this port.
   */
  promiseManager = new PromiseManager();

  /**
   * A Map holding callbacks.
   */
  callbackMap = new StrongMapWithKeyCreator<string, any>(
    new StringKeyGenerotor()
  );

  /**
   * Manager for temporary proxies who are in responsible to call remote callbacks.
   */
  proxyHolder: TmpProxyCreator;

  public callResolve(path: string) {
    return this.promiseManager.createPromise((key) => {
      this.port.postMessage({ key, type: "resolve", path });
    });
  }

  public callFunction(path: string, args: any[]) {
    return this.promiseManager.createPromise((key) => {
      this.port.postMessage({
        key,
        type: "function",
        path,
        args: this.serialize(args),
      });
    });
  }

  public callRelease(path: string) {
    return this.promiseManager.createPromise((key) => {
      return this.port.postMessage({ key, type: "release", path });
    });
  }

  private dispatch = (msg: Message) => {
    switch (msg.type) {
      case "resolve":
        this.performResolve(msg);
        break;
      case "function":
        this.performFunction(msg);
        break;
      case "release":
        this.performRelease(msg);
        break;
      case "function-":
      case "resolve-":
      case "release-":
        this.promiseManager.completePromise(msg.ans, msg.error, msg.data);
    }
  };

  private objectHolder: { impl: any } = { impl: undefined };

  public set impl(value: any) {
    this.objectHolder.impl = value;
  }

  private async performResolve(msg: ResolveRequest) {
    this.port.postMessage({
      ans: msg.key,
      type: "resolve-",
      data: await get(this.objectHolder, msg.path),
      error: undefined,
    });
  }

  private async performFunction(msg: FunctionRequest) {
    let data: any;
    let error: any;

    try {
      data = await get(this.objectHolder, msg.path)(this.deserialize(msg.args));
    } catch (e) {
      error = e;
    } finally {
      this.port.postMessage({
        ans: msg.key,
        type: "function-",
        data,
        error,
      });
    }
  }

  performRelease(msg: ReleaseRequest) {
    let data: any;
    let error: any;

    try {
      data = this.callbackMap.delete(msg.path);
    } catch (e) {
      error = e;
    } finally {
      this.port.postMessage({
        ans: msg.key,
        type: "release-",
        data,
        error,
      });
    }
  }

  /**
   * Make arguments transferable
   * @param raw Raw arguments
   */
  serialize(args: any[]): SerializedArgs {
    const callbacks: any[] = [];
    const raw: any[] = [];
    for (let i = 0; i < args.length; ++i) {
      const arg = args[i];
      switch (typeof arg) {
        case "function":
          callbacks.push({
            pos: i,
            key: this.callbackMap.put(arg),
          });
          raw.push(null);
          break;
        case "symbol":
          throw new Error(
            `Argument [${i}]:${String(arg)} is a symbol and not serializable`
          );
        default:
          raw.push(arg);
      }
    }
    return { raw, callbacks };
  }

  /**
   * Decode serialized arguments
   * @param args Serialized Arguments
   */
  deserialize(args: SerializedArgs): any[] {
    const nArgs = args.raw;
    for (const c of args.callbacks) {
      nArgs[c.position] = this.proxyHolder.getOrCreate(c.key);
    }
    return nArgs;
  }
}

class TmpProxyCreator extends WeakMapWithValueCreator<string, any> {
  constructor(private op: ObjectPort) {
    super(
      (path) => createProxy(op, path, this),
      (key) => op.callRelease(key)
    );
  }
}
