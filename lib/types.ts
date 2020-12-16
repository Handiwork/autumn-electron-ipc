// Literal Types
type LiteralType = NonOptionalLiteralType | LiteralOptional
type NonOptionalLiteralType =
    "string"
    | "number"
    | "bigint"
    | "boolean"
    | LiteralObject
    | LiteralArray
type LiteralObject = { [x: string]: LiteralType }
type LiteralArray = ["array", NonOptionalLiteralType]
type LiteralOptional = LiteralSpecifiedOptional | LiteralUndifinedOptional
type LiteralUndifinedOptional = undefined
type LiteralSpecifiedOptional = ["optional", NonOptionalLiteralType]

// Real Types
type Unknown = "real-type-unknown"
type RealObject<T extends LiteralObject> = { [x in keyof T]: RealType<T[x]> }
type RealOptional<T extends LiteralType> = NonOptionalRealType<T> | undefined
type RealArray<T extends LiteralType> = Array<NonOptionalRealType<T>>
type NonOptionalRealType<T extends LiteralType> =
    T extends "string" ? string :
    T extends "number" ? number :
    T extends "bigint" ? bigint :
    T extends "boolean" ? boolean :
    T extends LiteralObject ? RealObject<T> :
    T extends LiteralArray ? RealArray<T[1]> :
    Unknown
export type RealType<T extends LiteralType> =
    T extends LiteralUndifinedOptional ? undefined :
    T extends LiteralSpecifiedOptional ? RealOptional<T[1]> :
    NonOptionalRealType<T>

interface FunctionDef {
    input?: LiteralType
    output?: LiteralType
}

export interface IPCManifest {
    [x: string]: FunctionDef
}

type PromiseRealType<T extends LiteralType> =
    RealType<T> extends Unknown ? Promise<void> : Promise<RealType<T>>
type APIFunction<T extends FunctionDef> =
    RealType<T["input"]> extends Unknown ? NoArgFunction<T> :
    T["input"] extends LiteralOptional ? OptionalFunction<T> :
    CompleteFunction<T>

interface NoArgFunction<D extends FunctionDef> {
    (): PromiseRealType<D["output"]>
}

interface OptionalFunction<D extends FunctionDef> {
    (param?: RealType<D["input"]>): PromiseRealType<D["output"]>
}

interface CompleteFunction<D extends FunctionDef> {
    (param: RealType<D["input"]>): PromiseRealType<D["output"]>
}
export type API<T extends IPCManifest> = { [x in keyof T]: APIFunction<T[x]> }

// Normal Types
type TFunction<A extends any[], R> = (...args: A) => R

type Promisify<T> = T extends TFunction<infer A, Promise<infer R>> ? T :
    T extends TFunction<infer A, infer R> ? TFunction<A, Promise<R>> :
    () => Promise<T>

export type Client<T> = { [x in keyof T]: Promisify<T[x]> }