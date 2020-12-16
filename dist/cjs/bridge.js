"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createM2RApiTs = exports.createR2MApiTs = exports.createM2RApi = exports.createR2MApi = void 0;
const api_1 = require("./api");
/**
 * create API bridge between RENDERER process caller and MAIN process callee
 * @param manifest API manifest
 * @param channel the channel to use
 */
function createR2MApi(channel, manifest) {
    return new api_1.R2MAPIm(channel, manifest);
}
exports.createR2MApi = createR2MApi;
/**
 * create API bridge between MAIN process caller and RENDERER process callee
 * @param manifest API manifest
 * @param channel the channel to use
 */
function createM2RApi(channel, manifest) {
    return new api_1.M2RAPIm(channel, manifest);
}
exports.createM2RApi = createM2RApi;
/**
 * create API bridge between RENDERER process caller and MAIN process callee
 *
 * **generic type required**
 * @param channel the channel to use
 */
function createR2MApiTs(channel) {
    return new api_1.R2MAPI(channel);
}
exports.createR2MApiTs = createR2MApiTs;
/**
 * create API bridge between MAIN process caller and RENDERER process callee
 *
 * **generic type required**
 * @param channel the channel to use
 */
function createM2RApiTs(channel) {
    return new api_1.M2RAPI(channel);
}
exports.createM2RApiTs = createM2RApiTs;
