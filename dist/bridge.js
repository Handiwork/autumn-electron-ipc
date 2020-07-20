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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.createR2MApi = exports.createM2RApi = exports.checkManifest = void 0;
var electron_1 = require("electron");
function checkManifest(manifest) {
    return manifest;
}
exports.checkManifest = checkManifest;
var CHANNEL_NAME = "ipc-basic-channel";
/**
 * create API bridge between MAIN process caller and RENDERER process callee
 * @param manifest API manifest
 * @param channel the channel to use, default to "ipc-basic-channel",
 * NOTICE:`${channel}-{new Date().getTime()}` channels are used for api reply
 */
function createM2RApi(manifest, channel) {
    if (channel === void 0) { channel = CHANNEL_NAME; }
    return {
        manifest: manifest,
        /**
         * plug bridge in renderer process implementation
         * @param impl the object that implements API
         */
        plugInRenderer: function (impl) {
            var _this = this;
            electron_1.ipcRenderer.on(channel, function (e, replayChannel, name, args) { return __awaiter(_this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, impl[name](args)];
                        case 1:
                            result = _a.sent();
                            e.sender.send(replayChannel, result);
                            return [2 /*return*/];
                    }
                });
            }); });
        },
        /**
         * get client for target webContents
         * @param win target webContents
         */
        getClientFor: function (win) {
            var api = {};
            var _loop_1 = function (name_1) {
                api[name_1] = function (args) { return new Promise(function (resolve, reject) {
                    var replyChannel = channel + "-" + new Date().getTime();
                    win.send(channel, replyChannel, name_1, args);
                    electron_1.ipcMain.once(replyChannel, function (e, args) {
                        resolve(args);
                    });
                }); };
            };
            for (var name_1 in manifest) {
                _loop_1(name_1);
            }
            return api;
        }
    };
}
exports.createM2RApi = createM2RApi;
/**
 * create API bridge between renderer process caller and main process callee
 * @param manifest API manifest
 * @param channel the channel to use, default to "ipc-basic-channel"
 */
function createR2MApi(manifest, channel) {
    if (channel === void 0) { channel = CHANNEL_NAME; }
    return {
        manifest: manifest,
        plugInMain: function (impl) {
            var _this = this;
            electron_1.ipcMain.handle(channel, function (e, name, args) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, impl[name](args)];
                        case 1: return [2 /*return*/, _a.sent()];
                    }
                });
            }); });
        },
        getClient: function () {
            var api = {};
            var _loop_2 = function (name_2) {
                api[name_2] = function (args) { return electron_1.ipcRenderer.invoke(channel, name_2, args); };
            };
            for (var name_2 in manifest) {
                _loop_2(name_2);
            }
            return api;
        }
    };
}
exports.createR2MApi = createR2MApi;
