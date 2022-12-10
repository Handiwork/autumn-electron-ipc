import type { ObjectHolder } from "./core/object-holder";
import type { ObjectPort } from "./core/object-port";
import { createManagedObjectPort } from "./core/object-port";
import type { GPort } from "./core/protocol";
import type { ProxyManager } from "./core/proxy-manager";
import type { RemoteProxy } from "./core/remote-proxy";
import { MAIN_KEY } from "./constants";

/**
 * Client running in the renderer.
 */
export class IPCClient<L, R> {
  #port: ObjectPort;
  #holder: ObjectHolder;
  #proxyManager: ProxyManager;

  constructor(port: GPort) {
    this.#port = createManagedObjectPort(port, MAIN_KEY);
    this.#proxyManager = this.#port.proxyManager;
    this.#holder = this.#port.objectHolder;
    port.start();
  }

  /**
   * get remote proxy.
   */
  get proxy(): RemoteProxy<R> {
    return this.#proxyManager.getDefault();
  }

  /**
   * set local implememtation
   * @param impl implementation
   */
  setImpl(impl: L) {
    this.#holder.setDefault(impl);
  }
}
