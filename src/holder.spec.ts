import { ObjectHolder, WeakMapWithValueCreator } from "./holder";

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

describe("Object Holder", () => {
  const map = new ObjectHolder();

  beforeEach(() => {
    map.clear();
  });

  it("should return original object when get with generated key", () => {
    const obj = new String("hello");
    const key = map.post(obj);
    expect(map.get(key)).toBe(obj);
  });

  it("get should return undefined", () => {
    expect(map.get("1298en23")).toBeUndefined();
  });

  it("delete should always return true in this conditions", () => {
    expect(map.delete("1298en23[12]")).toBe(true);
  });

  it("sample process should works", () => {
    const obj = new String("obj");
    const key = map.post(obj);
    expect(map.get(key)).toBe(obj);
    expect(map.delete(key)).toBe(true);
  });
});
