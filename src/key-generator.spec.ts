import { KeyGenerator, StringKeyGenerotor } from "./key-generator";

describe("Key Generator", () => {
  const generator = new KeyGenerator();

  it("the key should be of type number", () => {
    expect(typeof generator.next()).toBe("number");
  });

  it("every key should be distict", () => {
    const set = new Set<number>();
    for (let i = 0; i < 500; i++) {
      const cur = generator.next();
      expect(set.has(cur)).toBe(false);
      set.add(cur);
    }
  });
});

describe("String Key Generator", () => {
  const generator = new StringKeyGenerotor();

  it("the key should be of type string", () => {
    expect(typeof generator.next()).toBe("string");
  });

  it("every key should be distict", () => {
    const set = new Set<string>();
    for (let i = 0; i < 500; i++) {
      const cur = generator.next();
      expect(set.has(cur)).toBe(false);
      set.add(cur);
    }
  });
});
