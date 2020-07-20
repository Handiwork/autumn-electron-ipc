# Autumn Electron IPC

This library is used to create well typed IPC API for [Electron](https://www.electronjs.org). In Typescript environment, this library confirms the consistency between callers and callees.

## Get Started

In this chapter, we will create an render-to-main API, which calls from renderer process and works on main process.

### Step 1: create the IPC bridge

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
class Server implements API<typeof r2mApi.manifest>{

    client: API<typeof m2rApi.manifest>

    constructor(win: BrowserWindow) {
        this.client = m2rApi.getClientFor(win.webContents)
    }

    async hello(who?: string) {
        return `hello ${who ?? "guest"}`
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
        setTimeout(async () => {
            console.log(`client.hello(["init", "from", "main"]): ${await this.client.hello(["init", "from", "main"])}`)
        }, 1000);
    }
}

async function bootstrap() {
    await app.whenReady()
    let win = new BrowserWindow(/* options */)
    const server = new Server(win)
    //*************************************
    r2mApi.plugInMain(server)
    //*************************************
    win.loadFile(/* file */)
    win.show()
}

bootstrap()
```
## APIs
[Docs Here](./api)


