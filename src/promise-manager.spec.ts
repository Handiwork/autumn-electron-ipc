import PromiseManager, { KeyGenerator } from "./promise-manager";

describe("Promise Manager", () => {
  it("should return promise when create", () => {
    const promiseManager = new PromiseManager(new KeyGenerator());
    expect(promiseManager.createPromise(() => undefined)).toBeInstanceOf(
      Promise
    );
  });

  it("should resolve promise when call completePromise", async () => {
    const predefinedString = "hello world";
    const promiseManager = new PromiseManager(new KeyGenerator());
    const expr = async () =>
      promiseManager.createPromise((key) => {
        setTimeout(() => {
          promiseManager.completePromise(key, undefined, predefinedString);
        }, 200);
      });
    await expect(expr()).resolves.toBe(predefinedString);
  });

  it("should no-op if trying to complete no-existing promise", () => {
    return new Promise((done) => {
      const promiseManager = new PromiseManager(new KeyGenerator());
      const expr = async () =>
        promiseManager.createPromise((key) => {
          setTimeout(() => {
            promiseManager.completePromise(-key - 1, undefined, "");
          }, 0);
        });
      const result: any = undefined;
      setTimeout(() => {
        expect(result).toBeUndefined();
        done("");
      }, 200);
      expr();
    });
  });
});
