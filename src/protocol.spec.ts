import { StrongMapWithKeyCreator, WeakMapWithValueCreator } from "./holder";
import PromiseManager, { StringKeyGenerotor } from "./promise-manager";
import type { GPort, Message } from "./protocol";
import { Receiver } from "./protocol";
import { Sender } from "./protocol";

describe("Sender & Receiver", () => {
  function createPorts() {
    const port1: any = {
      postMessage(msg: Message): void {
        port2.listener?.call(this, msg);
      },
      on(event: "message", listener: (msg: Message) => void): void {
        this.listener = listener;
      },
    };
    const port2: any = {
      postMessage(msg: Message): void {
        port1.listener?.call(this, msg);
      },
      on(event: "message", listener: (msg: Message) => void): void {
        this.listener = listener;
      },
    };
    return [port1, port2];
  }

  it("should resolve hello", async () => {
    const [port1, port2] = createPorts();

    const pm1 = new PromiseManager();
    const callbackMap1 = new StrongMapWithKeyCreator<string, any>(
      new StringKeyGenerotor()
    );
    const tmpProxy1 = new WeakMapWithValueCreator<string, any>(
      (key) => key,
      () => undefined
    );
    const sender1 = new Sender(port1, pm1, callbackMap1);
    const receiver1 = new Receiver(port1, pm1, tmpProxy1, callbackMap1);

    const pm2 = new PromiseManager();
    const callbackMap2 = new StrongMapWithKeyCreator<string, any>(
      new StringKeyGenerotor()
    );
    const tmpProxy2 = new WeakMapWithValueCreator<string, any>(
      (key) => key,
      () => undefined
    );
    const sender2 = new Sender(port2, pm2, callbackMap2);
    const receiver2 = new Receiver(port2, pm2, tmpProxy2, callbackMap2);

    receiver2.impl = { hello: "hello" };
    const result = sender1.resolve("hello");
    await expect(result).resolves.toBe("hello");
  });
});
