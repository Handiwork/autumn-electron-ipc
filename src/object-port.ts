import ObjectHolder from "./object-holder";
import PromiseManager from "./promise-manager";
import type {
  FunctionRequest,
  GPort,
  Message,
  ResolveRequest,
  SerializedArgs,
  UnmountRequest,
} from "./protocol";
import ProxyManager from "./proxy-manager";

export interface Sender {
  callResolve<T>(path: string): Promise<T>;
  callRelease(path: string): Promise<boolean>;
  callFunction<T>(path: string, args: any[]): Promise<T>;
}

export interface Receiver {
  performResolve(msg: ResolveRequest): Promise<void>;
  performFunction(msg: FunctionRequest): Promise<void>;
  performRelease(msg: UnmountRequest): void;
}

/**
 * Wrapper for {@link GPort}, make it able to delegate function arguments.
 */
export class ObjectPort implements Sender, Receiver {
  constructor(
    private port: GPort,
    public readonly proxyManager: ProxyManager,
    public readonly objectHolder: ObjectHolder
  ) {
    port.on("message", this.dispatch.bind(this));
  }

  /**
   * Proxy manager for this port.
   */
  private promiseManager = new PromiseManager();

  public callResolve<T>(path: string) {
    return this.promiseManager.createPromise((key) => {
      this.port.postMessage({ key, type: "resolve", path });
    }) as Promise<T>;
  }

  public callFunction<T>(path: string, args: any[]) {
    return this.promiseManager.createPromise((key) => {
      this.port.postMessage({
        key,
        type: "function",
        path,
        args: this.serialize(args),
      });
    }) as Promise<T>;
  }

  public callRelease(path: string) {
    return this.promiseManager.createPromise((key) => {
      return this.port.postMessage({ key, type: "unmount", path });
    }) as Promise<boolean>;
  }

  private dispatch = (msg: Message) => {
    switch (msg.type) {
      case "resolve":
        this.performResolve(msg);
        break;
      case "function":
        this.performFunction(msg);
        break;
      case "unmount":
        this.performRelease(msg);
        break;
      case "function-":
      case "resolve-":
      case "unmount-":
        this.promiseManager.completePromise(msg.ans, msg.error, msg.data);
    }
  };

  async performResolve(msg: ResolveRequest) {
    this.port.postMessage({
      ans: msg.key,
      type: "resolve-",
      data: await this.objectHolder.get(msg.path),
      error: undefined,
    });
  }

  async performFunction(msg: FunctionRequest) {
    let data: any;
    let error: any;

    try {
      data = await this.objectHolder.get(msg.path)(
        ...this.deserialize(msg.args)
      );
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

  performRelease(msg: UnmountRequest) {
    let data: any;
    let error: any;

    try {
      data = this.objectHolder.delete(msg.path);
    } catch (e) {
      error = e;
    } finally {
      this.port.postMessage({
        ans: msg.key,
        type: "unmount-",
        data,
        error,
      });
    }
  }

  /**
   * Make arguments transferable
   * @param args Raw arguments
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
            key: this.objectHolder.hold(arg),
          });
          raw.push(null);
          break;
        case "symbol":
          throw new Error(
            `Argument [${i}]:${String(
              arg
            )} is a symbol that can not be serialized`
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
      nArgs[c.pos] = this.proxyManager.getOrCreate(c.key);
    }
    return nArgs;
  }
}

export function createManagedObjectPort(port: GPort, mainKey: string) {
  const proxyManager = new ProxyManager(mainKey);
  const objectHolder = new ObjectHolder(mainKey);

  const op = new ObjectPort(port, proxyManager, objectHolder);
  proxyManager.sender = op;

  return op;
}
