import { KeyGenerator } from "./key-generator";
import { PromiseManager } from "./promise-manager";

it("should return a promise when calling createPromise", () => {
  const promiseManager = new PromiseManager();
  expect(promiseManager.createPromise(() => undefined)).toBeInstanceOf(Promise);
});

it("should resolve promise when calling completePromise with data", async () => {
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

it("shoule reject  promise when calling completePromise with err", async () => {
  const predefinedString = "hello world";
  const promiseManager = new PromiseManager(new KeyGenerator());
  const p = promiseManager.createPromise((key) => {
    setTimeout(() => {
      promiseManager.completePromise(key, predefinedString, undefined);
    }, 200);
  });
  await expect(p).rejects.toBe(predefinedString);
});

it("should no-op if trying to complete no-existing promise", () => {
  const manager = new PromiseManager();
  expect(() => manager.completePromise(-1, "unhandled", undefined)).not.toThrow(
    "unhandled",
  );
});

it("all promises should be rejected after calling rejectAll", async () => {
  const manager = new PromiseManager();
  const p1 = manager.createPromise((key) => {
    setTimeout(() => {
      manager.completePromise(key, undefined, "p1");
    }, 200);
  });
  const p2 = manager.createPromise((key) => {
    setTimeout(() => {
      manager.completePromise(key, undefined, 12);
    }, 200);
  });

  setTimeout(() => manager.rejectAll(), 50);

  await expect(p1).rejects.toBe("abandoned");
  await expect(p2).rejects.toBe("abandoned");
});
