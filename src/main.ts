import type {
  IpcMain,
  IpcMainEvent,
  MessagePortMain,
  WebContents,
} from "electron";
import { MessageChannelMain } from "electron";
import { buildChannelName, MAIN_KEY } from "./constants";
import { ObjectHolder } from "./core/object-holder";
import { ObjectPort } from "./core/object-port";
import type { GPort, Message } from "./core/protocol";
import { ProxyManager } from "./core/proxy-manager";
import type { RemoteProxy } from "./core/remote-proxy";

export type ChangeListener = (
  webContents: WebContents,
  port: ObjectPort
) => void;

/**
 * Create {@link GPort} from {@link MessageChannelMain}
 * @param nativePort port in main thread
 * @returns port bases on the native port
 */
export function createGPort(nativePort: MessagePortMain): GPort {
  return {
    postMessage(msg: Message): void {
      nativePort.postMessage(msg);
    },
    on(event: "message", listener: (msg: Message) => void): void {
      nativePort.on("message", (e) => listener(e.data));
      // important
      nativePort.start();
    },
  };
}

/**
 * IPC Server running in main thread.
 * @param L local Type
 * @param R remote type
 */
export class IPCServer<L, R> {
  #ports = new Map<WebContents, ObjectPort>();
  #channelName: string;
  #onConnect?: ChangeListener;
  #onDestroy?: ChangeListener;
  #holder = new ObjectHolder(MAIN_KEY);

  /**
   * Create server.
   * @param salt salt to distinguish different servers.
   */
  constructor(salt = "") {
    this.#channelName = buildChannelName(salt);
  }

  handleConnectRequest = (event: IpcMainEvent) => {
    const senderWebContents = event.sender;
    console.log(`connect request from webcontents: ${senderWebContents.id}`);
    const { port1, port2 } = new MessageChannelMain();

    const gport = createGPort(port1);
    const proxyManager = new ProxyManager(MAIN_KEY);
    const op = new ObjectPort(gport, proxyManager, this.#holder);
    proxyManager.sender = op;

    this.#ports.set(senderWebContents, op);
    senderWebContents.postMessage(this.#channelName, null, [port2]);
    senderWebContents.on("destroyed", () => {
      this.#ports.delete(senderWebContents);
      this.#onDestroy?.(senderWebContents, op);
    });
    this.#onConnect?.(senderWebContents, op);
  };

  /**
   * Start accepting channel establishing request.
   */
  listen(ipcMain: IpcMain) {
    ipcMain.on(this.#channelName, this.handleConnectRequest);
  }

  onDestroy(listener: ChangeListener) {
    this.#onDestroy = listener;
  }

  onConnect(listener: ChangeListener) {
    this.#onConnect = listener;
  }

  getProxyOf(target: WebContents): RemoteProxy<R> {
    return this.#ports.get(target)?.proxyManager?.getDefault();
  }

  setImpl(impl: L) {
    this.#holder.setDefault(impl);
  }
}
