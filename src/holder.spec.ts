import { StrongMapWithKeyCreator, WeakMapWithValueCreator } from "./holder";
import { StringKeyGenerotor } from "./promise-manager";

describe("Weak Map", () => {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const map = new WeakMapWithValueCreator<string, String>(
    (key) => new String(`object ${key}`),
    () => undefined
  );

  it("should obtain same object if exists", async () => {
    const key = "12380sjlasdkas";
    const obj = map.getOrCreate(key);
    expect(map.getOrCreate(key)).toBe(obj);
  });
});

describe("Stong Map", () => {
  const map = new StrongMapWithKeyCreator(new StringKeyGenerotor());

  beforeEach(() => {
    map.clear();
  });

  it("should create same key when called with same objecct", () => {
    const obj = new String("hello");
    const key = map.put(obj);
    expect(map.put(obj)).toBe(key);
  });

  it("should return original object when get with generated key", () => {
    const obj = new String("hello");
    const key = map.put(obj);
    expect(map.get(key)).toBe(obj);
  });

  it("get should throw an exception if key does not exist", () => {
    expect(() => map.get("1298en23")).toThrow("not exist");
  });

  it("delete should throw an exception if key does not exist", () => {
    expect(() => map.delete("1298en23")).toThrow("not exist");
  });

  it("sample process should works", () => {
    const obj = new String("obj");
    const key = map.put(obj);
    expect(map.get(key)).toBe(obj);
    const key2 = map.put(obj);
    expect(key).toBe(key2);
    map.delete(key);
    expect(() => map.delete(key)).toThrow("not exist");
  });
});
