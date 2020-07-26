"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.M2RAPIm = exports.M2RAPI = exports.R2MAPIm = exports.R2MAPI = void 0;
var electron_1 = require("electron");
function call(impl, prop) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return __awaiter(this, void 0, void 0, function () {
        var target;
        return __generator(this, function (_a) {
            target = impl[prop];
            if (typeof target === "function") {
                return [2 /*return*/, target.call.apply(target, __spreadArrays([impl], args))];
            }
            else {
                return [2 /*return*/, target];
            }
            return [2 /*return*/];
        });
    });
}
function getReplyChannel(channel) {
    return channel + "-" + new Date().getTime();
}
var R2MAPI = /** @class */ (function () {
    function R2MAPI(channel) {
        this.channel = channel;
    }
    /**
     * plug bridge in main process implementation
     * @param impl the object that implements API
     */
    R2MAPI.prototype.plugInMain = function (impl) {
        var _this = this;
        electron_1.ipcMain.handle(this.channel, function (_, name) {
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, call.apply(void 0, __spreadArrays([impl, name], args))];
                });
            });
        });
    };
    /**
     * get renderer client
     */
    R2MAPI.prototype.getClient = function () {
        var _this = this;
        return new Proxy({}, {
            get: function (_, prop) {
                return function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return electron_1.ipcRenderer.invoke.apply(electron_1.ipcRenderer, __spreadArrays([_this.channel, prop], args));
                };
            }
        });
    };
    return R2MAPI;
}());
exports.R2MAPI = R2MAPI;
var R2MAPIm = /** @class */ (function (_super) {
    __extends(R2MAPIm, _super);
    function R2MAPIm(channel, manifest) {
        var _this = _super.call(this, channel) || this;
        _this.manifest = manifest;
        return _this;
    }
    return R2MAPIm;
}(R2MAPI));
exports.R2MAPIm = R2MAPIm;
var M2RAPI = /** @class */ (function () {
    function M2RAPI(channel) {
        this.channel = channel;
    }
    /**
     * plug bridge in renderer process implementation
     * @param impl the object that implements API
     */
    M2RAPI.prototype.plugInRenderer = function (impl) {
        var _this = this;
        electron_1.ipcRenderer.on(this.channel, function (e, replayChannel, name) {
            var args = [];
            for (var _i = 3; _i < arguments.length; _i++) {
                args[_i - 3] = arguments[_i];
            }
            return __awaiter(_this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, call.apply(void 0, __spreadArrays([impl, name], args))];
                        case 1:
                            result = _a.sent();
                            e.sender.send(replayChannel, result);
                            return [2 /*return*/];
                    }
                });
            });
        });
    };
    /**
     * get client for target webContents
     * @param webContents target webContents
     */
    M2RAPI.prototype.getClientFor = function (webContents) {
        var _this = this;
        return new Proxy({}, {
            get: function (_, prop) {
                return function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    return new Promise(function (resolve, _) {
                        var replyChannel = getReplyChannel(_this.channel);
                        webContents.send.apply(webContents, __spreadArrays([_this.channel, replyChannel, prop], args));
                        electron_1.ipcMain.once(replyChannel, function (_, result) {
                            resolve(result);
                        });
                    });
                };
            }
        });
    };
    return M2RAPI;
}());
exports.M2RAPI = M2RAPI;
var M2RAPIm = /** @class */ (function (_super) {
    __extends(M2RAPIm, _super);
    function M2RAPIm(channel, manifest) {
        var _this = _super.call(this, channel) || this;
        _this.manifest = manifest;
        return _this;
    }
    return M2RAPIm;
}(M2RAPI));
exports.M2RAPIm = M2RAPIm;
