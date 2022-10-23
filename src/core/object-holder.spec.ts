import { ObjectHolder } from "./object-holder";

const map = new ObjectHolder("IMPL");

beforeEach(() => {
  map.clear();
});

it("should return original object when get with generated key", () => {
  const obj = new String("hello");
  const key = map.hold(obj);
  expect(map.get(key)).toBe(obj);
});

it("get should return undefined if key does not exist", () => {
  expect(map.get("1298en23")).toBeUndefined();
});

it("should return the same key if hold the same object twice", () => {
  const target = { title: "sample" };
  const firstKey = map.hold(target);
  const secondKey = map.hold(target);
  expect(firstKey).toBe(secondKey);
});

it("delete should always return true in any conditions", () => {
  expect(map.delete("1298en23[12]")).toBe(true);
});

it("sample process should works", () => {
  const obj = new String("obj");
  const key = map.hold(obj);
  expect(map.get(key)).toBe(obj);
  const obj2 = new String("obj2");
  map.put(key, obj2);
  expect(map.get(key)).toBe(obj2);
  expect(map.delete(key)).toBe(true);
});
