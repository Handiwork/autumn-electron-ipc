# Autumn Electron IPC

This library is used to create well typed IPC API for [Electron](https://www.electronjs.org). Within a Typescript (aided) environment, this library confirms the consistency between callers and callees.

 [Home Page Here](https://handiwork.github.io/autumn-electron-ipc/)

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

## Get Started (Typescript)
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
 [Go Home Page Here](https://handiwork.github.io/autumn-electron-ipc/)
