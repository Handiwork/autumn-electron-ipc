import { ObjectHolder } from "./holder";
import PromiseManager from "./promise-manager";
import type {
  FunctionRequest,
  GPort,
  Message,
  ReleaseRequest,
  ResolveRequest,
  SerializedArgs,
} from "./protocol";
import ProxyCreator from "./proxy-creator";

const IMPL_KEY = "IMPL";

export default class ObjectPort {
  constructor(private port: GPort) {
    this.proxyHolder = new ProxyCreator(this);
    port.on("message", this.dispatch);
  }

  /**
   * Proxy manager for this port.
   */
  private promiseManager = new PromiseManager();

  /**
   * Manager for proxies .
   */
  private proxyHolder: ProxyCreator;

  public get proxy() {
    return this.proxyHolder.getOrCreate(IMPL_KEY);
  }

  private objectHolder = new ObjectHolder();

  public set impl(value: any) {
    this.objectHolder.put(IMPL_KEY, value);
  }

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

  private async performResolve(msg: ResolveRequest) {
    this.port.postMessage({
      ans: msg.key,
      type: "resolve-",
      data: await this.objectHolder.get(msg.path),
      error: undefined,
    });
  }

  private async performFunction(msg: FunctionRequest) {
    let data: any;
    let error: any;

    try {
      data = await this.objectHolder.get(msg.path)(this.deserialize(msg.args));
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
      data = this.objectHolder.delete(msg.path);
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
            key: this.objectHolder.post(arg),
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
