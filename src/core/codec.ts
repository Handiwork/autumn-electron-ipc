import type { ObjectHolder } from "./object-holder";
import type { SerializedArgs } from "./protocol";
import type { ProxyManager } from "./proxy-manager";

export class Codec {
  constructor(
    private proxyManager: ProxyManager,
    private objectHolder: ObjectHolder,
  ) {}

  /**
   * Make arguments transferable
   * @param args Raw arguments
   */
  serialize(args: any[]): SerializedArgs {
    const callbacks: SerializedArgs["callbacks"] = [];
    const raw: any[] = [];
    for (let i = 0; i < args.length; ++i) {
      const arg = args[i];
      switch (typeof arg) {
        case "function":
          callbacks.push({
            pos: i,
            key: this.objectHolder.hold(arg),
          });
          raw.push(null);
          break;
        case "symbol":
          throw new Error(
            `Argument [${i}]:${String(
              arg,
            )} is a symbol that can not be serialized`,
          );
        default:
          raw.push(arg);
      }
    }
    return { raw, callbacks };
  }

  /**
   * Decode serialized arguments
   * @param args Serialized Arguments
   */
  deserialize(args: SerializedArgs): any[] {
    const nArgs = [...args.raw];
    for (const c of args.callbacks) {
      nArgs[c.pos] = this.proxyManager.getOrCreate(c.key);
    }
    return nArgs;
  }
}
