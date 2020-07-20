import { createM2RApi, createR2MApi } from '../../lib';

export const m2rApi = createM2RApi({
    hello: {
        input: ["array", "string"],
        output: "string"
    }
})

export const r2mApi = createR2MApi({
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