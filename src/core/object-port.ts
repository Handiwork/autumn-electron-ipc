import { Codec } from "./codec";
import { ObjectHolder } from "./object-holder";
import { PromiseManager } from "./promise-manager";
import type {
  FunctionRequest,
  GPort,
  Message,
  ResolveRequest,
  UnmountRequest,
} from "./protocol";
import { ProxyManager } from "./proxy-manager";

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
    /**
     * Underlying GPort
     */
    private port: GPort,
    /**
     * Related proxy manager
     */
    public readonly proxyManager: ProxyManager,
    /**
     * Related object holder
     */
    public readonly objectHolder: ObjectHolder,
  ) {
    this.#codec = new Codec(proxyManager, objectHolder);
    port.on("message", (msg) => this.dispatch(msg));
  }

  /**
   * Proxy manager for this port.
   */
  private promiseManager = new PromiseManager();
  #codec: Codec;

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
        args: this.#codec.serialize(args),
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
        break;
      default:
        break;
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
      const lastDot = msg.path.lastIndexOf(".");
      const _this =
        lastDot === -1
          ? undefined
          : this.objectHolder.get(msg.path.substring(0, lastDot));
      const fun = this.objectHolder.get(msg.path).bind(_this);
      data = await fun(...this.#codec.deserialize(msg.args));
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
    this.port.postMessage({
      ans: msg.key,
      type: "unmount-",
      data: this.objectHolder.delete(msg.path),
      error: undefined,
    });
  }
}

export function createManagedObjectPort(port: GPort, mainKey: string) {
  const proxyManager = new ProxyManager(mainKey);
  const objectHolder = new ObjectHolder(mainKey);

  const op = new ObjectPort(port, proxyManager, objectHolder);
  proxyManager.sender = op;

  return op;
}
