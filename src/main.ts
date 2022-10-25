import type { WebContents } from "electron";
import { ipcMain, MessageChannelMain } from "electron";
import { ObjectHolder } from "./core/object-holder";
import { ObjectPort } from "./core/object-port";
import type { Message } from "./core/protocol";
import { ProxyManager } from "./core/proxy-manager";
import type { RemoteProxy } from "./core/remote-proxy";
import { buildChannelName, MAIN_KEY } from "./constants";

export type ConnectListener = (
  webContents: WebContents,
  port: ObjectPort
) => void;

/**
 * IPC Server running in main thread.
 * @param L local Type
 * @param R remote type
 */
export class IPCServer<L, R> {
  #ports = new Map<WebContents, ObjectPort>();
  #channelName: string;
  #listener?: ConnectListener;
  #holder = new ObjectHolder(MAIN_KEY);

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
    ipcMain.on(this.#channelName, (event) => {
      const senderWebContents = event.sender;
      const { port1, port2 } = new MessageChannelMain();

      const gport = {
        postMessage(msg: Message): void {
          port1.postMessage(msg);
        },
        on(event: "message", listener: (msg: Message) => void): void {
          port1.on("message", (e) => listener(e.data));
        },
      };
      const proxyManager = new ProxyManager(MAIN_KEY);
      const op = new ObjectPort(gport, proxyManager, this.#holder);
      proxyManager.sender = op;

      this.#ports.set(senderWebContents, op);
      senderWebContents.postMessage(this.#channelName, null, [port2]);
      this.#listener?.(senderWebContents, op);
      senderWebContents.on("destroyed", () => {
        console.debug(`channel destroy: ${senderWebContents.id}`);
        this.#ports.delete(senderWebContents);
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
