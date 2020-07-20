import { app, BrowserWindow } from 'electron';
import { resolve } from 'path';

import { r2mApi, m2rApi } from "../common";
import { API, RealType } from '../../lib';

class Server implements API<typeof r2mApi.manifest>{

    client: API<typeof m2rApi.manifest>

    constructor(win: BrowserWindow) {
        this.client = m2rApi.getClientFor(win.webContents)
    }

    async hello(who?: string) {
        return `hello ${who ?? "guest"}`
    }

    async complex(param: RealType<{
        f1: "string";
        f2: "number";
    }>) {
        return {
            f1: param.f2,
            f2: param.f1
        }
    }

    async sigOk() {
        setTimeout(async () => {
            console.log(`client.hello(["init", "from", "main"]): ${await this.client.hello(["init", "from", "main"])}`)
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
    win.maximize()
    const server = new Server(win)
    r2mApi.plugInMain(server)
    win.loadFile(resolve(__dirname, '../ui/index.html'))
    win.show()
}

bootstrap()