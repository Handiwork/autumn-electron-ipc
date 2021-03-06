# Autumn Electron IPC

This library is used to create well typed IPC API for [Electron](https://www.electronjs.org). Within a Typescript (aided) environment, it confirms the consistency between callers and callees.

## Requirements
-  `electron >= 7.0 `
-  `typescript >= 3.7` (not specified as a peerdependency, but required to build with typescript or to get typing suggestions in a javascript project)

## Install

 ```bash
 yarn add autumn-electron-ipc
 ```
 from github
  ```bash
 yarn add https://github.com/Handiwork/autumn-electron-ipc.git
 ```

## Usage in Typescript
Here we'll create a renderer-to-main API, which is called from renderer process and works on main process.

### Step 1: create an API interface and export the API bridge
```typescript
// in shared file, can be imoported in both main and renderer process

export interface APIMain {
    key: string
    hello(...who: string[]): string
    asyncHello(...who: string[]): Promise<string>
    sigOk(): void
}

// the generic type APIMain is required
export const r2mApiTs = createR2MApiTs<APIMain>("r2m-ts")

```
### Step 2: implement API and connect with the bridge in main process
```typescript
// in main process

class MainServer implements APIMain {

    client: ClientAPI<APIRenderer>
    key: string = "proxy main server"

    constructor(win: BrowserWindow) {
        // this is a main process client
        this.client = m2rApiTs.getClientFor(win.webContents)
    }

    hello(...who: string[]): string {
        return who.join(" SYNC ")
    }

    async asyncHello(...who: string[]): Promise<string> {
        return who.join(" ASYNC ")
    }

    async sigOk() {
        const r = await this.client.hello(["call", "from", "main"]);
        console.log(`client.hello(["call", "from", "main"]): ${r}`)
    }
}
```

```typescript
// in main process

r2mApiTs.plugInMain(new MainServer(win))
```
### Step 3: get and use client in renderer process
```ts
// in renderer process

log(`tsClient.key(): ${await tsClient.key()}`)
log(`tsClient.hello("a", "b", "c"): ${await tsClient.hello("a", "b", "c")}`)
log(`tsClient.asyncHello("e", "f", "g"): ${await tsClient.asyncHello("e", "f", "g")}`)
log(`tsClient.sigOk(): ${await tsClient.sigOk()}`)
```

> **note**: exposed properties and functions are all transformed to async functions on the client side.

### Main to renderer API

Swap code location and call `createM2RApiTs()`, `plugInRenderer(...)`, `getClientFor(...)` function series instead.

## Usage in Javascript

Since javascript environment does not support interface,we will create an render-to-main API based on a manifest object.

### Step 1: create an IPC bridge

```typescript
// in common file,
// shared by both main process and renderer process

export const r2mApi = createR2MApi("r2m-channel",{
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

If you want to create a manifest object with typing, do use `checkManifest` function, this function checks your manifest and preserve the original type.
```typescript
const manifest = checkManifest({
    hello: {
        input: ["array", "string"],
        output: "string"
    },
})

export r2mApi = createR2MApi("my-special-channel" , manifest)
```

### Step 2: plug the bridge into the worker in main process

```typescript
// in main process 

async function bootstrap() {
    await app.whenReady()
    let win = new BrowserWindow(/* options */)
    //*************************************
    const server = checkApiImpl(r2mApi.manifest, {
        client: m2rApi.getClientFor(win.webContents),
        async hello(who?) {
            return `hello ${who || "guest"}`
        },
        async complex(param) {
            return {
                f1: param.f2,
                f2: param.f1
            }
        },
        async sigOk() {
            setTimeout(async () => {
                console.log(`client.hello(["call", "from", "main"]): `
                    + await this.client.hello(["call", "from", "main"]))
            }, 1000);
        }
    })
    r2mApi.plugInMain(server)
    //*************************************
    win.loadFile(/* file */)
    win.show()
}

bootstrap()
```
![variable-hint](imgs/variable-hint.png)

### Step 3: create and use client in renderer process
```typescript
// in renderer process, preload script preferred

export async function bootstrap(log) {
    const client = r2mApi.getClient()
    log(`client.hello("Autumn"): ${await client.hello("Autumn")}`)
    log(`client.hello(): ${await client.hello()}`)
    log(`client.complex({ f1: "nine", f2: 9 })}: ${JSON.stringify(await client.complex({ f1: "nine", f2: 9 }))}`)
    log(`client.sigOk(): ${await client.sigOk()}`)
}
```

That's all.

To create an **main-to-renderer** API, which calls from main process and works on renderer process, use `createR2MApi(...)` instead, then call `plugInRenderer(...)` in renderer precess, and call `getClientFor(...)` in main process to get a client.

## Manifest Supported Types

This lib supports part of **primitives**:

- undifined: `undifined`
- string: `"string"`
- number: `"number"`
- bigint: `"bigint"` (if your runtime supports)
- boolean `"boolean"`

some **structure**:

- array: `["array", <non undifined type>]`
- object: `{ <key>: <type>}`

for signature:
- optional: `["optional", <non undifined type>]`

## APIs
Source code generated docs are [here](https://handiwork.tollife.cn/autumn-electron-ipc/api/).


