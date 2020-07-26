import { ipcMain, ipcRenderer, WebContents } from "electron"

async function call(impl: any, prop: string, ...args: any[]) {
    const target = impl[prop]
    if (typeof target === "function") {
        return target.call(impl, ...args)
    } else {
        return target
    }
}

function getReplyChannel(channel: string) {
    return `${channel}-${new Date().getTime()}`
}

export class R2MAPI<S, C> {
    constructor(private channel: string) { }
    /**
     * plug bridge in main process implementation
     * @param impl the object that implements API
     */
    plugInMain<I extends S>(impl: I) {
        ipcMain.handle(this.channel, async (_, name, ...args) => {
            return call(impl, name, ...args)
        })
    }
    /**
     * get renderer client
     */
    getClient(): C {
        return new Proxy<any>({}, {
            get: (_, prop) => {
                return (...args: any[]) => ipcRenderer.invoke(this.channel, prop, ...args)
            }
        })
    }
}

export class R2MAPIm<S, C, M> extends R2MAPI<S, C>{
    constructor(channel: string, public manifest: M) {
        super(channel)
    }
}

export class M2RAPI<S, C>{
    constructor(private channel: string) { }
    /**
     * plug bridge in renderer process implementation
     * @param impl the object that implements API
     */
    plugInRenderer<I extends S>(impl: I) {
        ipcRenderer.on(
            this.channel,
            async (e, replayChannel, name, ...args) => {
                let result = await call(impl, name, ...args)
                e.sender.send(replayChannel, result)
            }
        )
    }
    /**
     * get client for target webContents
     * @param webContents target webContents
     */
    getClientFor(webContents: WebContents): C {
        return new Proxy<any>({}, {
            get: (_, prop) => {
                return (...args: any[]) => new Promise((resolve, _) => {
                    const replyChannel = getReplyChannel(this.channel)
                    webContents.send(this.channel, replyChannel, prop, ...args)
                    ipcMain.once(replyChannel, (_, result) => {
                        resolve(result)
                    })
                })
            }
        })
    }
}

export class M2RAPIm<S, C, M> extends M2RAPI<S, C>{
    constructor(channel: string, public manifest: M) {
        super(channel)
    }
}