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
type LiteralOptional = SpecifiedOptional | UndifinedOptional
type UndifinedOptional = undefined
type SpecifiedOptional = ["optional", NonOptionalLiteralType]

interface FunctionDef {
    input?: LiteralType
    output?: LiteralType
}

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
    "real-type-unknown"
export type RealType<T extends LiteralType> =
    T extends UndifinedOptional ? undefined :
    T extends SpecifiedOptional ? RealOptional<T[1]> :
    NonOptionalRealType<T>


export interface IPCManifest {
    [x: string]: FunctionDef
}

type PromiseWrap<T> = T extends "real-type-unknown" ? Promise<void> : Promise<T>
type APIFunction<T extends FunctionDef> =
    RealType<T["input"]> extends "real-type-unknown" ? NoArgFunction<T> :
    T["input"] extends LiteralOptional ? OptionalFunction<T> :
    CompleteFunction<T>

interface NoArgFunction<D extends FunctionDef> {
    (): PromiseWrap<RealType<D["output"]>>
}

interface OptionalFunction<D extends FunctionDef> {
    (param?: RealType<D["input"]>): PromiseWrap<RealType<D["output"]>>
}

interface CompleteFunction<D extends FunctionDef> {
    (param: RealType<D["input"]>): PromiseWrap<RealType<D["output"]>>
}
export type API<T extends IPCManifest> = { [x in keyof T]: APIFunction<T[x]> }
