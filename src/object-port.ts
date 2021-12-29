import { StrongMapWithKeyCreator, WeakMapWithValueCreator } from "./holder";
import PromiseManager, { StringKeyGenerotor } from "./promise-manager";
import type { GPort } from "./protocol";
import { Receiver, Sender } from "./protocol";
import type { RemoteProxy } from "./remote-proxy";

export default class ObjectPort<TRemote, TLocal> {
  constructor(private port: GPort) {
    const promiseManager = new PromiseManager();
    const remoteTokenHolder = new StrongMapWithKeyCreator<string, any>(
      new StringKeyGenerotor()
    );
    const sender = new Sender(port, promiseManager, remoteTokenHolder);
    this.proxyCreator = new ProxyCreator(sender);
    const tmpProxyMap = new TmpProxyCreator(sender);
    this.receiver = new Receiver(
      port,
      promiseManager,
      tmpProxyMap,
      remoteTokenHolder
    );
  }

  /**
   * Set local implementation
   */
  public set impl(value: TLocal) {
    this.receiver.impl = value;
  }
  /**
   * Get root proxy
   */
  public get proxy(): RemoteProxy<TRemote> {
    return this.proxyCreator.getOrCreate("");
  }

  /**
   * Held Proxies
   */
  private proxyCreator: ProxyCreator;
  private receiver: Receiver;
}

class ProxyCreator extends WeakMapWithValueCreator<string, any> {
  constructor(private sender: Sender) {
    super(
      (path) => this.createProxy(path),
      () => undefined
    );
  }
  private createProxy(path: string) {
    const proxy = new Proxy<any>(
      {},
      {
        get: (target, p: string) => {
          const fullPath = `${path}.${p}`;
          if (p.charAt(0) === "$") {
            return this.sender.resolve(fullPath);
          } else {
            return this.getOrCreate(fullPath);
          }
        },
        apply: (target, thisArg, args: any[]) => {
          return this.sender.callFunction(path, args);
        },
      }
    );
    return proxy;
  }
}

class TmpProxyCreator extends WeakMapWithValueCreator<string, any> {
  constructor(private sender: Sender) {
    super(
      (path) => this.createProxy(path),
      (key) => this.releaseRemoteCallback(key)
    );
  }

  private releaseRemoteCallback(key: string) {
    this.sender.release(key);
  }

  private createProxy(path: string) {
    const proxy = new Proxy<any>(
      {},
      {
        get: (target, p: string) => {
          const fullPath = `${path}.${p}`;
          if (p.charAt(0) === "$") {
            return this.sender.resolve(fullPath);
          } else {
            return this.getOrCreate(fullPath);
          }
        },
        apply: (target, thisArg, args: any[]) => {
          return this.sender.callFunction(path, args);
        },
      }
    );
    return proxy;
  }
}
