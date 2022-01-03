import get from "lodash.get";
import type {
  StrongMapWithKeyCreator,
  WeakMapWithValueCreator,
} from "./holder";
import type PromiseManager from "./promise-manager";

export interface SerializedArgs {
  raw: any[];
  callbacks: any[];
}

export interface RequestBase {
  key: number;
  type: string;
  path: string;
}

export interface ResolveRequest extends RequestBase {
  type: "resolve";
}

interface FunctionRequest extends RequestBase {
  type: "function";
  args: SerializedArgs;
}

export interface ReleaseRequest extends RequestBase {
  type: "release";
}

export type Request = ResolveRequest | FunctionRequest | ReleaseRequest;

export interface ResponseBase {
  ans: number;
  data?: any;
  error: any;
}

export interface ResolveResponse extends ResponseBase {
  type: "resolve-";
}

export interface FunctionResponse extends ResponseBase {
  type: "function-";
}

interface ReleaseResponse extends ResponseBase {
  type: "release-";
}

export type Response = ResolveResponse | FunctionResponse | ReleaseResponse;

export type Message = Request | Response;

export interface GPort {
  postMessage(msg: Message): void;
  on(event: "message", listener: (msg: Message) => void): void;
}

export class Sender {
  constructor(
    private port: GPort,
    private promiseManager: PromiseManager,
    private callbackMap: StrongMapWithKeyCreator<string, any>
  ) {}

  public resolve(path: string) {
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

  public release(path: string) {
    return this.promiseManager.createPromise((key) => {
      return this.port.postMessage({ key, type: "release", path });
    });
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
}

export class Receiver {
  constructor(
    private port: GPort,
    private promiseManager: PromiseManager,
    private tmpProxyMap: WeakMapWithValueCreator<string, any>,
    private callbackMap: StrongMapWithKeyCreator<string, any>
  ) {
    port.on("message", this.dispatch);
  }

  dispatch = (msg: Message) => {
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
        this.completeFunction(msg);
        break;
      case "resolve-":
        this.completeResolve(msg);
        break;
      case "release-":
        this.completeRelease(msg);
    }
  };

  public impl: any;

  private async performResolve(msg: ResolveRequest) {
    let data: any;
    let error: any;

    try {
      data = await get(this.impl, msg.path);
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

  private async performFunction(msg: FunctionRequest) {
    let data: any;
    let error: any;

    try {
      data = await get(this.impl, msg.path)(this.deserialize(msg.args));
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

  completeResolve(msg: ResolveResponse) {
    this.promiseManager.completePromise(msg.ans, msg.error, msg.data);
  }

  completeFunction(msg: FunctionResponse) {
    this.promiseManager.completePromise(msg.ans, msg.error, msg.data);
  }

  completeRelease(msg: ReleaseResponse) {
    this.promiseManager.completePromise(msg.ans, msg.error, msg.data);
  }

  /**
   * Decode serialized arguments
   * @param args Serialized Arguments
   */
  deserialize(args: SerializedArgs): any[] {
    const nArgs = args.raw;
    for (const c of args.callbacks) {
      nArgs[c.position] = this.tmpProxyMap.getOrCreate(c.key);
    }
    return nArgs;
  }
}
