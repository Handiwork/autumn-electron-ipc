import { ipcMain, ipcRenderer, WebContents, MessageChannelMain } from "electron"
import { API, Client, IPCManifest } from "./types"

async function call(impl: any, prop: string, ...args: any[]) {
    const target = impl[prop]
    if (typeof target === "function")
        return target.call(impl, ...args)
    else return target
}

export class R2MAPI<S> {
    constructor(private channel: string) { }
    /**
     * plug bridge in main process implementation
     * @param impl the object that implements API
     */
    plugInMain<I extends S>(impl: I) {
        ipcMain.removeHandler(this.channel)
        ipcMain.handle(this.channel, async (_, name, ...args) => {
            return call(impl, name, ...args)
        })
    }
    /**
     * get renderer client
     */
    getClient(): Client<S> {
        return new Proxy<any>({}, {
            get: (_, prop) => {
                return (...args: any[]) => ipcRenderer.invoke(this.channel, prop, ...args)
            }
        })
    }
}

export class R2MAPIm<M extends IPCManifest> extends R2MAPI<API<M>>{
    constructor(channel: string, public manifest: M) {
        super(channel)
    }
}

export class M2RAPI<S>{
    constructor(private channel: string) { }
    /**
     * plug bridge in renderer process implementation
     * @param impl the object that implements API
     */
    plugInRenderer<I extends S>(impl: I) {
        ipcRenderer.removeAllListeners(this.channel)
        ipcRenderer.on(
            this.channel,
            async (e, msg) => {
                const [name, ...args] = msg
                const [port] = e.ports
                let result = await call(impl, name, ...args)
                port.postMessage(result)
                port.close()
            }
        )
    }
    /**
     * get client for target webContents
     * @param webContents target webContents
     */
    getClientFor(webContents: WebContents): Client<S> {
        return new Proxy<any>({}, {
            get: (_, prop) => {
                return (...args: any[]) => new Promise((resolve, _) => {
                    const { port1, port2 } = new MessageChannelMain()
                    port1.once("message", (e) => {
                        resolve(e.data)
                        port1.close()
                    })
                    port1.start()
                    webContents.postMessage(this.channel, [prop, ...args], [port2])
                })
            }
        })
    }
}

export class M2RAPIm<M extends IPCManifest> extends M2RAPI<API<M>>{
    constructor(channel: string, public manifest: M) {
        super(channel)
    }
}