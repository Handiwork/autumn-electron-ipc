import type { MessagePortMain } from "electron";
import type { GPort, Message } from "src/protocol";

/**
 * Electron implementation for {@link GPort}.
 */
export function createGPort(nativePort: MessagePortMain): GPort {
  return {
    postMessage(msg: Message): void {
      nativePort.postMessage(msg);
    },
    on(event: "message", listener: (msg: Message) => void): void {
      nativePort.on(event, (e) => listener(e.data));
    },
  };
}
