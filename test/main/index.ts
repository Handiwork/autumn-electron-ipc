import { app, BrowserWindow } from 'electron';
import { resolve } from 'path';

import { r2mApi, m2rApi, APIMain, r2mApiTs, APIRenderer, m2rApiTs } from "../common";
import { checkApiImpl, ClientAPI } from '../../lib';

class MainServer implements APIMain {

    client: ClientAPI<APIRenderer>
    key: string = "proxy main server"

    constructor(win: BrowserWindow) {
        this.client = m2rApiTs.getClientFor(win.webContents)
    }

    hello(...who: string[]): string {
        return who.join(" SYNC ")
    }

    async asyncHello(...who: string[]): Promise<string> {
        return who.join(" ASYNC ")
    }

    sigOk() {
        setTimeout(async () => {
            console.log(`client.hello(["call", "from", "main"]): `
                + await this.client.hello(["call", "from", "main"]))
        }, 1000);
    }
}

async function bootstrap() {
    let win: BrowserWindow
    await app.whenReady()
    win = new BrowserWindow({
        webPreferences: {
            preload: resolve(__dirname, "../pre/index.js")
        },
        show: false
    })
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
    r2mApiTs.plugInMain(new MainServer(win))
    win.maximize()
    win.loadFile(resolve(__dirname, '../ui/index.html'))
    win.show()
}

bootstrap()