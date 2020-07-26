import { createM2RApi, createR2MApi, createTsR2MApi, createTsM2RApi } from '../../lib';

export const m2rApi = createM2RApi("m2r-channel", {
    hello: {
        input: ["array", "string"],
        output: "string"
    }
})

export const r2mApi = createR2MApi("r2m-chennel", {
    hello: {
        input: ["optional", "string"],
        output: "string"
    },
    complex: {
        input: {
            f1: "string",
            f2: "number"
        },
        output: {
            f1: "number",
            f2: "string"
        }
    },
    sigOk: {}
})

export interface APIMain {
    key: string
    hello(...who: string[]): string
    asyncHello(...who: string[]): Promise<string>
    sigOk(): void
}
export const r2mApiTs = createTsR2MApi<APIMain>("r2m-ts")

export interface APIRenderer {
    hello(who: string[]): string
}

export const m2rApiTs = createTsM2RApi<APIRenderer>("m2r-ts")
