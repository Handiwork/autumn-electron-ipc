import type { GPort, Message } from "./protocol";

describe("Sender", () => {
  class MGPort implements GPort {
    postMessage(msg: Message): void {
      throw new Error("Method not implemented.");
    }
    on(event: "message", listener: (msg: Message) => void): void {
      throw new Error("Method not implemented.");
    }
  }
});
