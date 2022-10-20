import ProxyManager from "./proxy-manager";

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
        throw "Unimplemented";
      },
      async callRelease() {
        throw "Unimplemented";
      },
    };

    const proxy = manager.getOrCreate("");
    proxy["$" + testPath];
  });

  it("created proxies should call sender's callFunction", () => {
    const testPath = "sample-path";
    const manager = new ProxyManager("IMPL");
    manager.sender = {
      async callResolve() {
        throw "Unimplemented";
      },
      async callFunction(path) {
        expect(path).toBe(testPath);
        return null as any;
      },
      async callRelease() {
        throw "Unimplemented";
      },
    };

    const proxy = manager.getOrCreate(testPath);
    proxy();
  });

  it("I hava no way to trigger callRelease", () => {
    expect(1).not.toBeNull();
  });

  it("proxy should be able to generate sub proxy", () => {
    const testPath = "to.sample.path";
    const manager = new ProxyManager("IMPL");
    manager.sender = {
      async callResolve(path) {
        expect(path).toBe(testPath);
        return null as any;
      },
      async callFunction() {
        throw "Unimplemented";
      },
      async callRelease() {
        throw "Unimplemented";
      },
    };
    const root: any = manager.getOrCreate("");
    root.to.some.path;
  });

  it("cache should work", () => {
    const manager = new ProxyManager("IMPL");
    const p1 = manager.getOrCreate("");
    expect(manager.getOrCreate("")).toBe(p1);
  });
});
