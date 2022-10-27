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

## APIs

See -> [APIs](https://handiwork.github.io/autumn-electron-ipc/api/)
