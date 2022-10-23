import { Codec } from "./codec";
import type { SerializedArgs } from "./protocol";
import { ProxyManager } from "./proxy-manager";

describe("serialize", () => {
  it("serializable args should be passed directly", () => {
    const codec = new Codec(null as any, null as any);
    const args = [undefined, null, 1, "string", true, {}];
    const serialized = codec.serialize(args);
    expect(serialized.raw).toEqual(args);
  });

  it("function args should be hold", () => {
    const holder = {
      hold: jest.fn().mockReturnValue("12"),
    };
    const codec = new Codec(null as any, holder as any);
    function f1() {
      return true;
    }
    function f2() {
      return 1;
    }
    const args = [f1, f2];
    const serialized = codec.serialize(args);
    expect(serialized.callbacks).toEqual([
      { pos: 0, key: "12" },
      { pos: 1, key: "12" },
    ]);
    expect(holder.hold.mock.calls.map((it) => it[0])).toEqual([f1, f2]);
  });

  it("unserializable args should trigger an error", () => {
    const codec = new Codec(null as any, null as any);
    expect(() => {
      codec.serialize([Symbol("sym")]);
    }).toThrow(Error);
  });
});

describe("deserialize", () => {
  it("callbacks should be replaced by callable proxies", () => {
    const codec = new Codec(new ProxyManager(""), null as any);
    const sa: SerializedArgs = {
      raw: [undefined, null, 1, "string", true, {}, null, null],
      callbacks: [
        {
          pos: 6,
          key: "12i32",
        },
        {
          pos: 7,
          key: "kka",
        },
      ],
    };
    const da = codec.deserialize(sa);
    expect(typeof da[6]).toBe("function");
    expect(typeof da[7]).toBe("function");
  });
});
