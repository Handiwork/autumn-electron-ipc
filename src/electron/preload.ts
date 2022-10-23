import { ipcRenderer } from "electron";
import type { GPort, Message } from "../core/protocol";
import { buildChannelName, MAIN_KEY } from "./constants";

/**
 * try to connect to main service.
 * @param salt channel salt
 * @param timeout connect timeout
 * @returns instance of {@link GPort}
 * @throws "timeout"
 */
export function connect(salt = "", timeout = 1000): Promise<GPort> {
  const channelName = buildChannelName(salt);
  return new Promise((resolve, reject) => {
    ipcRenderer.on(channelName, (event) => {
      const nativePort = event.ports[0];
      resolve({
        postMessage(msg: Message): void {
          nativePort.postMessage(msg);
        },
        on(event: "message", listener: (msg: Message) => void): void {
          nativePort.addEventListener("message", (e) => listener(e.data));
        },
      });
    });
    ipcRenderer.send(channelName, MAIN_KEY);
    setTimeout(() => reject("timeout"), timeout);
  });
}
