declare type LiteralType = NonOptionalLiteralType | LiteralOptional;
declare type NonOptionalLiteralType = "string" | "number" | "bigint" | "boolean" | LiteralObject | LiteralArray;
declare type LiteralObject = {
    [x: string]: LiteralType;
};
declare type LiteralArray = ["array", NonOptionalLiteralType];
declare type LiteralOptional = LiteralSpecifiedOptional | LiteralUndifinedOptional;
declare type LiteralUndifinedOptional = undefined;
declare type LiteralSpecifiedOptional = ["optional", NonOptionalLiteralType];
declare type Unknown = "real-type-unknown";
declare type RealObject<T extends LiteralObject> = {
    [x in keyof T]: RealType<T[x]>;
};
declare type RealOptional<T extends LiteralType> = NonOptionalRealType<T> | undefined;
declare type RealArray<T extends LiteralType> = Array<NonOptionalRealType<T>>;
declare type NonOptionalRealType<T extends LiteralType> = T extends "string" ? string : T extends "number" ? number : T extends "bigint" ? bigint : T extends "boolean" ? boolean : T extends LiteralObject ? RealObject<T> : T extends LiteralArray ? RealArray<T[1]> : Unknown;
export declare type RealType<T extends LiteralType> = T extends LiteralUndifinedOptional ? undefined : T extends LiteralSpecifiedOptional ? RealOptional<T[1]> : NonOptionalRealType<T>;
interface FunctionDef {
    input?: LiteralType;
    output?: LiteralType;
}
export interface IPCManifest {
    [x: string]: FunctionDef;
}
declare type PromiseRealType<T extends LiteralType> = RealType<T> extends Unknown ? Promise<void> : Promise<RealType<T>>;
declare type APIFunction<T extends FunctionDef> = RealType<T["input"]> extends Unknown ? NoArgFunction<T> : T["input"] extends LiteralOptional ? OptionalFunction<T> : CompleteFunction<T>;
interface NoArgFunction<D extends FunctionDef> {
    (): PromiseRealType<D["output"]>;
}
interface OptionalFunction<D extends FunctionDef> {
    (param?: RealType<D["input"]>): PromiseRealType<D["output"]>;
}
interface CompleteFunction<D extends FunctionDef> {
    (param: RealType<D["input"]>): PromiseRealType<D["output"]>;
}
export declare type API<T extends IPCManifest> = {
    [x in keyof T]: APIFunction<T[x]>;
};
declare type TFunction<A extends any[], R> = (...args: A) => R;
declare type Promisify<T> = T extends TFunction<infer A, Promise<infer R>> ? T : T extends TFunction<infer A, infer R> ? TFunction<A, Promise<R>> : () => Promise<T>;
export declare type ClientAPI<T> = {
    [x in keyof T]: Promisify<T[x]>;
};
export {};
