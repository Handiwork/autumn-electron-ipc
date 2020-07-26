"use strict";
exports.__esModule = true;
exports.createM2RApiTs = exports.createR2MApiTs = exports.createM2RApi = exports.createR2MApi = exports.checkApiImpl = exports.checkManifest = void 0;
var api_1 = require("./api");
/**
 * check manifest object and preserve the original type
 * @param manifest
 */
function checkManifest(manifest) {
    return manifest;
}
exports.checkManifest = checkManifest;
/**
 * check implementation with manifest
 * @param manifest the API manifest
 * @param impl the implementation
 * @returns impl
 */
function checkApiImpl(manifest, impl) {
    return impl;
}
exports.checkApiImpl = checkApiImpl;
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
 * @param channel the channel to use, **notice**: `${channel}-${new Date().getTime()}` channels are used for API reply
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
 * @param channel the channel to use, **notice**: `${channel}-${new Date().getTime()}` channels are used for API reply
 */
function createM2RApiTs(channel) {
    return new api_1.M2RAPI(channel);
}
exports.createM2RApiTs = createM2RApiTs;
