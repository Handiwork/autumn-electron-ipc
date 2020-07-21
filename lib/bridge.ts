import { ipcRenderer, ipcMain, WebContents } from "electron"
import { IPCManifest, API } from "."

/**
 * check manifest object and preserve the original type
 * @param manifest 
 */
export function checkManifest<T extends IPCManifest>(manifest: T) {
    return manifest
}

/**
 * create API bridge between MAIN process caller and RENDERER process callee
 * @param manifest API manifest
 * @param channel the channel to use,  
 * **notice**: `${channel}-${new Date().getTime()}` channels are used for api reply
 */
export function createM2RApi<T extends IPCManifest>(channel: string, manifest: T) {
    return {
        manifest,
        /**
         * plug bridge in renderer process implementation
         * @param impl the object that implements API
         */
        plugInRenderer(impl: API<T>) {
            ipcRenderer.on(channel, async (e, replayChannel, name, args) => {
                let result = await impl[name](args)
                e.sender.send(replayChannel, result)
            })
        },
        /**
         * get client for target webContents
         * @param win target webContents
         */
        getClientFor(win: WebContents): API<T> {
            let api: any = {}
            for (let name in manifest) {
                api[name] = (args: any) => new Promise((resolve, reject) => {
                    const replyChannel = `${channel}-${new Date().getTime()}`
                    win.send(channel, replyChannel, name, args)
                    ipcMain.once(replyChannel, (e, args) => {
                        resolve(args)
                    })
                })
            }
            return api
        }
    }
}

/**
 * create API bridge between renderer process caller and main process callee
 * @param manifest API manifest
 * @param channel the channel to use
 */
export function createR2MApi<T extends IPCManifest>(channel: string, manifest: T) {
    return {
        manifest,
        plugInMain(impl: API<T>) {
            ipcMain.handle(channel, async (e, name, args) => {
                return await impl[name](args)
            })
        },
        getClient(): API<T> {
            let api: any = {}
            for (let name in manifest) {
                api[name] = (args: any) => ipcRenderer.invoke(channel, name, args)
            }
            return api
        }
    }
}
