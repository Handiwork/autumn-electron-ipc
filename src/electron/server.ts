import type { WebContents } from "electron";
import { ipcMain, MessageChannelMain } from "electron";
import ObjectHolder from "src/object-holder";
import { ObjectPort } from "src/object-port";
import ProxyManager from "src/proxy-manager";
import type { RemoteProxy } from "src/remote-proxy";
import { buildChannelName } from "./constants";
import { createGPort } from "./port";

type ConnectListener = (webContents: WebContents, port: ObjectPort) => void;

/**
 * IPC Server running in main thread.
 */
export default class IPCServer<L, R> {
  #ports = new Map<WebContents, ObjectPort>();
  #channelName: string;
  #listener?: ConnectListener;
  #holder: ObjectHolder;

  /**
   * Create server.
   * @param salt salt to distinguish different servers.
   */
  constructor(salt = "") {
    this.#channelName = buildChannelName(salt);
  }

  /**
   * Start accepting channel establishing request.
   */
  listen() {
    ipcMain.on(this.#channelName, (event, mainKey: string) => {
      const sender = event.sender;
      const { port1, port2 } = new MessageChannelMain();

      const gport = createGPort(port1);
      this.#holder = new ObjectHolder(mainKey);
      const proxyManager = new ProxyManager(mainKey);
      const op = new ObjectPort(gport, proxyManager, this.#holder);
      proxyManager.sender = op;

      this.#ports.set(sender, op);
      sender.postMessage(this.#channelName, null, [port2]);
      this.#listener?.(sender, op);
      sender.on("destroyed", () => {
        this.#ports.delete(sender);
      });
    });
  }

  onConnect(listener: ConnectListener) {
    this.#listener = listener;
  }

  getProxyOf(target: WebContents): RemoteProxy<R> {
    return this.#ports.get(target)?.proxyManager?.getDefault();
  }

  setImpl(impl: L) {
    this.#holder.setDefault(impl);
  }
}
