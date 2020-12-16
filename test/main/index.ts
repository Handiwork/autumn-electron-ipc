import { app, BrowserWindow } from 'electron';
import { resolve } from 'path';

import { r2mApi, m2rApi, APIMain, r2mApiTs, APIRenderer, m2rApiTs, mainWindowApi } from "../common";
import { checkApiImpl, Client } from '../../lib';

class MainServer implements APIMain {

    client: Client<APIRenderer>
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

    async sigOk() {
        const r = await this.client.hello(["call", "from", "main"]);
        console.log(`client.hello(["call", "from", "main"]): ${r}`)
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
            const r = await this.client.hello(["call", "from", "main"]);
            console.log(`client.hello(["call", "from", "main"]): ${r}`)
        }
    })
    r2mApi.plugInMain(server)
    r2mApiTs.plugInMain(new MainServer(win))
    mainWindowApi.plugInMain(win)
    // win.maximize()
    win.loadFile(resolve(__dirname, '../ui/index.html'))
    win.show()
}

bootstrap()