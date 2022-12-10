import type { IpcMainEvent, MessagePortMain, WebContents } from "electron";
import { ipcMain, MessageChannelMain } from "electron";
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
    },
    start() {
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
  #ports = new Map<number, ObjectPort>();
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
    const { port1, port2 } = new MessageChannelMain();

    const gport = createGPort(port1);
    gport.start();
    const proxyManager = new ProxyManager(MAIN_KEY);
    const op = new ObjectPort(gport, proxyManager, this.#holder);
    proxyManager.sender = op;

    this.#ports.set(senderWebContents.id, op);
    senderWebContents.postMessage(this.#channelName, null, [port2]);
    senderWebContents.on("destroyed", () => {
      this.#ports.delete(senderWebContents.id);
      this.#onDestroy?.(senderWebContents, op);
    });
    this.#onConnect?.(senderWebContents, op);
  };

  /**
   * Start accepting channel establishing request.
   */
  listen() {
    ipcMain.on(this.#channelName, this.handleConnectRequest);
  }

  setOnDestroyListener(listener?: ChangeListener) {
    this.#onDestroy = listener;
  }

  setOnConnectListener(listener?: ChangeListener) {
    this.#onConnect = listener;
  }

  /**
   * Get proxy targeting to the specified WebContents
   * @param target Target WebContents
   * @returns Proxy or undifined if no client is connected
   */
  getProxyOf(target: WebContents): RemoteProxy<R> | undefined {
    return this.#ports.get(target.id)?.proxyManager?.getDefault();
  }

  setImpl(impl: L) {
    this.#holder.setDefault(impl);
  }
}
