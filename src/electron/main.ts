import type { WebContents } from "electron";
import { ipcMain, MessageChannelMain } from "electron";
import { ObjectHolder } from "../core/object-holder";
import { ObjectPort } from "../core/object-port";
import type { Message } from "../core/protocol";
import { ProxyManager } from "../core/proxy-manager";
import type { RemoteProxy } from "../core/remote-proxy";
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
      const sender = event.sender;
      const { port1: nativePort, port2 } = new MessageChannelMain();

      const gport = {
        postMessage(msg: Message): void {
          nativePort.postMessage(msg);
        },
        on(event: "message", listener: (msg: Message) => void): void {
          nativePort.on(event, (e) => listener(e.data));
        },
      };
      const proxyManager = new ProxyManager(MAIN_KEY);
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
