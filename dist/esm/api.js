var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ipcMain, ipcRenderer, MessageChannelMain } from "electron";
function call(impl, prop, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        const target = impl[prop];
        if (typeof target === "function")
            return target.call(impl, ...args);
        else
            return target;
    });
}
export class R2MAPI {
    constructor(channel) {
        this.channel = channel;
    }
    /**
     * plug bridge in main process implementation
     * @param impl the object that implements API
     */
    plugInMain(impl) {
        ipcMain.removeHandler(this.channel);
        ipcMain.handle(this.channel, (_, name, ...args) => __awaiter(this, void 0, void 0, function* () {
            return call(impl, name, ...args);
        }));
    }
    /**
     * get renderer client
     */
    getClient() {
        return new Proxy({}, {
            get: (_, prop) => {
                return (...args) => ipcRenderer.invoke(this.channel, prop, ...args);
            }
        });
    }
}
export class R2MAPIm extends R2MAPI {
    constructor(channel, manifest) {
        super(channel);
        this.manifest = manifest;
    }
}
export class M2RAPI {
    constructor(channel) {
        this.channel = channel;
    }
    /**
     * plug bridge in renderer process implementation
     * @param impl the object that implements API
     */
    plugInRenderer(impl) {
        ipcRenderer.removeAllListeners(this.channel);
        ipcRenderer.on(this.channel, (e, msg) => __awaiter(this, void 0, void 0, function* () {
            const [name, ...args] = msg;
            const [port] = e.ports;
            let result = yield call(impl, name, ...args);
            port.postMessage(result);
            port.close();
        }));
    }
    /**
     * get client for target webContents
     * @param webContents target webContents
     */
    getClientFor(webContents) {
        return new Proxy({}, {
            get: (_, prop) => {
                return (...args) => new Promise((resolve, _) => {
                    const { port1, port2 } = new MessageChannelMain();
                    port1.once("message", (e) => {
                        resolve(e.data);
                        port1.close();
                    });
                    port1.start();
                    webContents.postMessage(this.channel, [prop, ...args], [port2]);
                });
            }
        });
    }
}
export class M2RAPIm extends M2RAPI {
    constructor(channel, manifest) {
        super(channel);
        this.manifest = manifest;
    }
}
