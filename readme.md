# Autumn Electron IPC

Since `remote` module is going to be deprated (see -> [Deprecate the 'remote' module and move it to userland](https://github.com/electron/electron/issues/21408)), we have to use IPC calls with anonymous arguments like `ipcRenderer.invoke("main-window","set-width",960)`, where Typescript is useless. This lib confirms the type consistency between callers and callees within a Typescript (aided) environment.

## Requirements
-  `electron >= 7.0 `
-  `typescript >= 3.7` (not specified as a peerdependency, but required to build with typescript or to get typing suggestions in a javascript project)

## Install

 ```
 yarn add autumn-electron-ipc
 ```

## Basic Use

```typescript
// define API in shared module: common

import { createR2MApiTs } from 'autumn-electron-ipc';
import { BrowserWindow } from 'electron';

export const mainWindowApi = createR2MApiTs<BrowserWindow>("main-window")
```

```typescript
// connect to impl in main process

import { mainWindowApi } from "../common"; // common

//...
win = new BrowserWindow({...})
//...
mainWindowApi.plugInMain(win) // connect to impl
//...

```

```typescript
// invoke in preload script

import { mainWindowApi } from "../common"; // common

function boostrap(){
    const mainWindow = mainWindowApi.getClient()
    setTimeout(async () => {
        // async call
        let maximized = await mainWindow.isMaximized() 
        if (maximized) mainWindow.restore()
        else mainWindow.maximize()
    }, 1000);
}
```

## APIs

For use cases like 

- call from main process and reponse in renderer process
- use this lib in javascript

See -> [HomePage](https://handiwork.github.io/autumn-electron-ipc/)
