import { ipcRenderer } from "electron";
import type ObjectHolder from "src/object-holder";
import type { ObjectPort } from "src/object-port";
import { createManagedObjectPort } from "src/object-port";
import type { GPort } from "src/protocol";
import type ProxyManager from "src/proxy-manager";
import { buildChannelName } from "./constants";
import { createGPort } from "./port";

/**
 * Client running in the renderer.
 */
export default class IPCClient {
  #port: ObjectPort;
  #holder: ObjectHolder;
  #proxyManager: ProxyManager;

  constructor(port: GPort, mainKey: string) {
    this.#port = createManagedObjectPort(port, mainKey);
    this.#proxyManager = this.#port.proxyManager;
    this.#holder = this.#port.objectHolder;
  }

  get proxy() {
    return this.#proxyManager.getDefault();
  }
}

export async function createClient(
  salt = "",
  timeout = 1000,
  mainKey = "IMPL"
): Promise<IPCClient> {
  const port = await connect(salt, timeout, mainKey);
  return new IPCClient(port, mainKey);
}

export function connect(
  salt = "",
  timeout = 1000,
  mainKey = "IMPL"
): Promise<GPort> {
  const channelName = buildChannelName(salt);
  return new Promise((resolve, reject) => {
    ipcRenderer.on(channelName, (event) => {
      resolve(createGPort(event.ports[0]));
    });
    ipcRenderer.send(channelName, mainKey);
    setTimeout(() => reject("timeout"), timeout);
  });
}
