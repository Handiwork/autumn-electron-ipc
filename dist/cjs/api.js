"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.M2RAPIm = exports.M2RAPI = exports.R2MAPIm = exports.R2MAPI = void 0;
const electron_1 = require("electron");
function call(impl, prop, ...args) {
    return __awaiter(this, void 0, void 0, function* () {
        const target = impl[prop];
        if (typeof target === "function") {
            return target.call(impl, ...args);
        }
        else {
            return target;
        }
    });
}
function getReplyChannel(channel) {
    return `${channel}-${new Date().getTime()}`;
}
class R2MAPI {
    constructor(channel) {
        this.channel = channel;
    }
    /**
     * plug bridge in main process implementation
     * @param impl the object that implements API
     */
    plugInMain(impl) {
        electron_1.ipcMain.handle(this.channel, (_, name, ...args) => __awaiter(this, void 0, void 0, function* () {
            return call(impl, name, ...args);
        }));
    }
    /**
     * get renderer client
     */
    getClient() {
        return new Proxy({}, {
            get: (_, prop) => {
                return (...args) => electron_1.ipcRenderer.invoke(this.channel, prop, ...args);
            }
        });
    }
}
exports.R2MAPI = R2MAPI;
class R2MAPIm extends R2MAPI {
    constructor(channel, manifest) {
        super(channel);
        this.manifest = manifest;
    }
}
exports.R2MAPIm = R2MAPIm;
class M2RAPI {
    constructor(channel) {
        this.channel = channel;
    }
    /**
     * plug bridge in renderer process implementation
     * @param impl the object that implements API
     */
    plugInRenderer(impl) {
        electron_1.ipcRenderer.on(this.channel, (e, replayChannel, name, ...args) => __awaiter(this, void 0, void 0, function* () {
            let result = yield call(impl, name, ...args);
            e.sender.send(replayChannel, result);
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
                    const replyChannel = getReplyChannel(this.channel);
                    webContents.send(this.channel, replyChannel, prop, ...args);
                    electron_1.ipcMain.once(replyChannel, (_, result) => {
                        resolve(result);
                    });
                });
            }
        });
    }
}
exports.M2RAPI = M2RAPI;
class M2RAPIm extends M2RAPI {
    constructor(channel, manifest) {
        super(channel);
        this.manifest = manifest;
    }
}
exports.M2RAPIm = M2RAPIm;
