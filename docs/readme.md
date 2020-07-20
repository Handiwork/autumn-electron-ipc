# Autumn Electron IPC

This library is used to create well typed IPC API for [Electron](https://www.electronjs.org). In Typescript environment, this library confirms the consistency between callers and callees.

## Get Started
To create an IPC, write the manifest first:
```typescript
    
```

```typescript
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
```

## APIs
[Docs Here](./api)


