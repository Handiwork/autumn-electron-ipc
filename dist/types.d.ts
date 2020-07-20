declare type LiteralType = NonOptionalLiteralType | LiteralOptional;
declare type NonOptionalLiteralType = "string" | "number" | "bigint" | "boolean" | LiteralObject | LiteralArray;
declare type LiteralObject = {
    [x: string]: LiteralType;
};
declare type LiteralArray = ["array", NonOptionalLiteralType];
declare type LiteralOptional = SpecifiedOptional | UndifinedOptional;
declare type UndifinedOptional = undefined;
declare type SpecifiedOptional = ["optional", NonOptionalLiteralType];
interface FunctionDef {
    input?: LiteralType;
    output?: LiteralType;
}
declare type RealObject<T extends LiteralObject> = {
    [x in keyof T]: RealType<T[x]>;
};
declare type RealOptional<T extends LiteralType> = NonOptionalRealType<T> | undefined;
declare type RealArray<T extends LiteralType> = Array<NonOptionalRealType<T>>;
declare type NonOptionalRealType<T extends LiteralType> = T extends "string" ? string : T extends "number" ? number : T extends "bigint" ? bigint : T extends "boolean" ? boolean : T extends LiteralObject ? RealObject<T> : T extends LiteralArray ? RealArray<T[1]> : "real-type-unknown";
export declare type RealType<T extends LiteralType> = T extends UndifinedOptional ? undefined : T extends SpecifiedOptional ? RealOptional<T[1]> : NonOptionalRealType<T>;
export interface IPCManifest {
    [x: string]: FunctionDef;
}
declare type PromiseWrap<T> = T extends "real-type-unknown" ? Promise<void> : Promise<T>;
declare type APIFunction<T extends FunctionDef> = RealType<T["input"]> extends "real-type-unknown" ? () => PromiseWrap<RealType<T["output"]>> : T["input"] extends LiteralOptional ? (param?: RealType<T["input"]>) => PromiseWrap<RealType<T["output"]>> : (param: RealType<T["input"]>) => PromiseWrap<RealType<T["output"]>>;
export declare type API<T extends IPCManifest> = {
    [x in keyof T]: APIFunction<T[x]>;
};
export {};
