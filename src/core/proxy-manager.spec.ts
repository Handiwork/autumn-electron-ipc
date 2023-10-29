import { ProxyManager } from "./proxy-manager";

it("getDefault() should return proxy of mainKey", () => {
  const mainKey = "1239enskdjaksdnr";
  const manager = new ProxyManager(mainKey);
  expect(manager.getDefault()).toBe(manager.getOrCreate(mainKey));
});

describe("created proxies", () => {
  it("created proxies should call sender's callResolve", () => {
    const testPath = "sample-path";
    const manager = new ProxyManager("IMPL");
    manager.sender = {
      async callResolve(path) {
        expect(path).toBe(testPath);
        return null as any;
      },
      async callFunction() {
        throw Error("Unimplemented");
      },
      async callRelease() {
        throw Error("Unimplemented");
      },
    };

    const proxy = manager.getOrCreate("");
    expect(proxy["$" + testPath]).resolves.toBeNull();
  });

  it("created proxies should call sender's callFunction", () => {
    const testPath = "sample-path";
    const manager = new ProxyManager("IMPL");
    manager.sender = {
      async callResolve() {
        throw Error("Unimplemented");
      },
      async callFunction(path) {
        expect(path).toBe(testPath);
        return null as any;
      },
      async callRelease() {
        throw Error("Unimplemented");
      },
    };

    const proxy = manager.getOrCreate(testPath);
    proxy();
  });

  it("should trigger callRelease", () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    let gc: () => void = () => {};

    class MockFinalizationRegistry<T> implements FinalizationRegistry<T> {
      map = new Map<any, { target: object; heldValue: T }>();

      constructor(finalization: (key: T) => void) {
        gc = () => {
          this.map.forEach((e) => finalization(e.heldValue));
        };
      }

      register(
        target: object,
        heldValue: T,
        unregisterToken?: object | undefined,
      ): void {
        this.map.set(unregisterToken ?? heldValue, { target, heldValue });
      }
      unregister(unregisterToken: object): void {
        this.map.delete(unregisterToken);
      }
      [Symbol.toStringTag]: "FinalizationRegistry";
    }

    // hard to mock
    global.FinalizationRegistry = MockFinalizationRegistry;
    const testPath = "sample-path";
    const manager = new ProxyManager("IMPL");
    manager.sender = {
      async callResolve() {
        throw Error("Unimplemented");
      },
      async callFunction() {
        throw Error("Unimplemented");
      },
      async callRelease(path) {
        expect(path).toBe(testPath);
        return null as any;
      },
    };

    manager.getOrCreate(testPath);
    gc();
  });

  it("proxy should be able to generate sub proxy", async () => {
    const testPath = "to.sample.path";
    const manager = new ProxyManager("IMPL");
    manager.sender = {
      async callResolve(path) {
        expect(path).toBe(testPath);
        return null as any;
      },
      async callFunction() {
        throw Error("Unimplemented");
      },
      async callRelease() {
        throw Error("Unimplemented");
      },
    };
    const root: any = manager.getOrCreate("");
    await expect(root.to.some.path).rejects.toThrowError("Unimplemented");
  });

  it("cache should work", () => {
    const manager = new ProxyManager("IMPL");
    const p1 = manager.getOrCreate("");
    expect(manager.getOrCreate("")).toBe(p1);
  });
});
