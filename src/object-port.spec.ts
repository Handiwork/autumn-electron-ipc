import ObjectPort from "./object-port";
import type { Message } from "./protocol";

function createGPorts() {
  const port1: any = {
    postMessage(msg: Message): void {
      setTimeout(() => {
        port2.listener?.call(this, msg);
      }, 0);
    },
    on(event: "message", listener: (msg: Message) => void): void {
      this.listener = listener;
    },
  };
  const port2: any = {
    postMessage(msg: Message): void {
      setTimeout(() => {
        port1.listener?.call(this, msg);
      }, 0);
    },
    on(event: "message", listener: (msg: Message) => void): void {
      this.listener = listener;
    },
  };
  return [port1, port2];
}

function createObjectPorts() {
  const [p1, p2] = createGPorts();
  return [new ObjectPort(p1), new ObjectPort(p2)];
}

describe("ObjectPort Resolve", () => {
  it("should resolve hello", async () => {
    const [op1, op2] = createObjectPorts();
    op2.impl = { hello: "hello" };
    await expect(op1.callResolve("hello")).resolves.toBe("hello");
  });

  it("should resolve undefined", async () => {
    const [op1] = createObjectPorts();
    await expect(op1.callResolve("hello")).resolves.toBe(undefined);
  });
});

describe("ObjectPort function call", () => {
  it("should resolve hello", async () => {
    const [op1, op2] = createObjectPorts();
    op2.impl = { hello: () => "hello" };
    await expect(op1.callFunction("hello", [])).resolves.toBe("hello");
  });

  it("should throw", async () => {
    const [op1, op2] = createObjectPorts();
    op2.impl = { hello: () => "hello" };
    await expect(op1.callFunction("be", [])).rejects.toThrowError(Error);
  });

  it("should callback with jack2", async () => {
    const [op1, op2] = createObjectPorts();
    op2.impl = {
      hello(who: string, callback: (who: string) => void) {
        callback(who + "2");
      },
    };
    op1.callFunction("hello", [
      "jack",
      (who: string) => {
        expect(who).toBe("jack2");
      },
    ]);
  });
});
