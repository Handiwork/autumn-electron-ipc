# Autumn Electron IPC

Since `remote` module is going to be deprated (see -> [Deprecate the 'remote' module and move it to userland](https://github.com/electron/electron/issues/21408)), we have to use IPC calls with anonymous arguments like `ipcRenderer.invoke("main-window","set-width",960)`, where Typescript is not that helpful. This lib confirms the type consistency between callers and callees within a Typescript (aided) environment.

This lib use typescript interfaces to build IPC, so you can simply import pre-defined interfaces from other packages to work together.  

## Requirements
-  `electron >= 7.0 `
-  `typescript >= 3.7` (not specified as a peerdependency, but required to build with typescript or to get typing suggestions in a javascript project)

## Install
npm
```
npm install autumn-electron-ipc
```
yarn

 ```
 yarn add autumn-electron-ipc
 ```

## Basic Use

define API in shared module:
```typescript
import { createR2MApiTs } from 'autumn-electron-ipc';
import { BrowserWindow } from 'electron';

export const mainWindowApi = createR2MApiTs<BrowserWindow>("main-window")
```

connect to implemtation in main process
```typescript
// import from shared module
import { mainWindowApi } from "../common"; 

//...
win = new BrowserWindow({...})
//...
mainWindowApi.plugInMain(win) // connect to impl
//...

```
invoke in preload script, or in renderer script if you enabled node integration
```typescript
// import from shared module
import { mainWindowApi } from "../common"; 

function boostrap(){
    const mainWindow = mainWindowApi.getClient()
    setTimeout(async () => {
        // all tranformed to async call
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
