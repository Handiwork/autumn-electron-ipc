import type { ObjectPort } from "./object-port";
import { createManagedObjectPort } from "./object-port";
import type { Message } from "./protocol";

function createGPorts() {
  const key = Math.random();
  const port1: any = {
    postMessage(msg: Message): void {
      setTimeout(() => {
        port2.listener?.(msg);
      }, 0);
    },
    on(event: "message", listener: (msg: Message) => void): void {
      this.listener = listener;
    },
    key,
  };
  const port2: any = {
    postMessage(msg: Message): void {
      setTimeout(() => {
        port1.listener?.(msg);
      }, 0);
    },
    on(event: "message", listener: (msg: Message) => void): void {
      this.listener = listener;
    },
    key,
  };
  return [port1, port2];
}

function createObjectPorts(): [ObjectPort, ObjectPort, string] {
  const [p1, p2] = createGPorts();
  const mainKey = "IMPL" + Math.random();
  return [
    createManagedObjectPort(p1, mainKey),
    createManagedObjectPort(p2, mainKey),
    mainKey,
  ];
}

describe("ObjectPort resolve", () => {
  it("should resolve hello", async () => {
    const [op1, op2] = createObjectPorts();
    op2.objectHolder.setDefault({ hello: "hello" });
    await expect(op1.proxyManager.getDefault().$hello).resolves.toBe("hello");
  });

  it("should resolve undefined", async () => {
    const [op1] = createObjectPorts();
    await expect(op1.proxyManager.getDefault().$hello).resolves.toBe(undefined);
  });
});

describe("ObjectPort function call", () => {
  it("should resolve hello", async () => {
    const [op1, op2] = createObjectPorts();
    op2.objectHolder.setDefault({ hello: () => "hello" });
    const hello = op1.proxyManager.getDefault().hello;
    await expect(hello()).resolves.toBe("hello");
  });

  it("should throw", async () => {
    const [op1, op2] = createObjectPorts();
    const impl = { hello: () => "hello" };
    op2.objectHolder.setDefault(impl);
    await expect(op1.proxyManager.getDefault().be()).rejects.toThrowError(
      Error
    );
  });

  it("should callback with jack2", async () => {
    const [op1, op2] = createObjectPorts();
    const impl = {
      hello(who: string, callback: (who: string) => void) {
        expect(who).toBe("jack");
        callback(who + "2");
      },
    };
    op2.objectHolder.setDefault(impl);
    await op1.proxyManager.getDefault().hello("jack", (who: string) => {
      expect(who).toBe("jack2");
    });
  });
});

describe("ObjectPort release", () => {
  it("should delete property hi", async () => {
    const [op1, op2, mainKey] = createObjectPorts();

    const impl = { hi: "hi" };
    op2.objectHolder.setDefault(impl);
    await op1.proxyManager.sender.callRelease(`${mainKey}.hi`);
    expect(impl.hi).toBeUndefined();
  });
});
