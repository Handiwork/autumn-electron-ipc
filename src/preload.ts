import type { IpcRenderer } from "electron";
import { buildChannelName, MAIN_KEY } from "./constants";
import type { GPort, Message } from "./core/protocol";

export function createGPort(nativePort: MessagePort) {
  return {
    postMessage(msg: Message): void {
      nativePort.postMessage(msg);
    },
    on(event: "message", listener: (msg: Message) => void): void {
      nativePort.onmessage = (e) => listener(e.data);
    },
  };
}

/**
 * try to connect to main service.
 * @param ipcRenderer ipcRenderer from electron
 * @param salt channel salt
 * @param timeout connect timeout
 * @returns instance of {@link GPort}
 * @throws "timeout"
 */
export function connect(
  ipcRenderer: IpcRenderer,
  salt = "",
  timeout = 1000
): Promise<GPort> {
  const channelName = buildChannelName(salt);
  return new Promise((resolve, reject) => {
    ipcRenderer.on(channelName, (event) => {
      console.log("connection established");
      const nativePort = event.ports[0];
      resolve(createGPort(nativePort));
    });
    ipcRenderer.send(channelName, MAIN_KEY);
    setTimeout(() => reject("timeout"), timeout);
  });
}
