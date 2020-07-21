# Autumn Electron IPC

This library is used to create well typed IPC API for [Electron](https://www.electronjs.org). In Typescript environment, this library confirms the consistency between callers and callees.

## Get Started

In this chapter, we will create an render-to-main API, which calls from renderer process and works on main process.

### Step 1: create an IPC bridge

```typescript
// in common file,
// shared by both main process and renderer process

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

---
***NOTE***

If you want to create a manifest object with typing assistance, do use `checkManifest` function, this function checks your manifest and preserve the original type.
```typescript
const manifest = checkManifest({
    hello: {
        input: ["array", "string"],
        output: "string"
    },
})
export r2mApi = createR2MApi(manifest,"my-special-channel")
```

***DO NOT*** type like this:

```typescript
const manifest: IPCManifest = {
    hello: {
        input: ["array", "string"],
        output: "string"
    }
}
export r2mApi = createR2MApi(manifest,"my-special-channel") 
```
---

### Step 2: plug the bridge into worker in main process

```typescript
// in main process 

class Server implements API<typeof r2mApi.manifest>{

    async hello(who?: string) {
        return `hello ${who | "guest"}`
    }

    async complex(param: RealType<{
        f1: "string";
        f2: "number";
    }>) {
        return {
            f1: param.f2,
            f2: param.f1
        }
    }

    async sigOk() {
         /* some code */
    }
}

async function bootstrap() {
    await app.whenReady()
    let win = new BrowserWindow(/* options */)
    //*************************************
    const server = new Server()
    r2mApi.plugInMain(server)
    //*************************************
    win.loadFile(/* file */)
    win.show()
}

bootstrap()
```
While IDEs cant not auto generate interface template from a `type`, you can use the hint of manifest and copy the definition.

<img src="imgs/manifest-hint.png"  style="display:block; margin: 0 auto; max-width: 500px;"/>

Wrap it with `RealType`, then parameter hint works:

<img src="imgs/variable-hint.png" style="display:block; margin: 0 auto; max-width: 320px;"/>


### Step 3: create and use client in renderer process
```typescript
// in renderer process, preload script preferred

export async function bootstrap(log:(string)=>void) {
    const client = r2mApi.getClient()
    log(`client.hello("Autumn"): ${await client.hello("Autumn")}`)
    log(`client.hello(): ${await client.hello()}`)
    const r = JSON.stringify(await client.complex({ f1: "nine", f2: 9 }))
    log(`client.complex({ f1: "nine", f2: 9 })}: ${r}`)
    log(`client.sigOk(): ${await client.sigOk()}`)
}
```

That's all.

## Supported Types

This lib supports plain json types.
- number - "number"
- 

## APIs
[Docs Here](https://handiwork.tollife.cn/autumn-electron-ipc/)


