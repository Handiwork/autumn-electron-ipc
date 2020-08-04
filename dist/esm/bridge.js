import { R2MAPIm, M2RAPIm, R2MAPI, M2RAPI } from "./api";
/**
 * check manifest object and preserve the original type
 * @param manifest
 */
export function checkManifest(manifest) {
    return manifest;
}
/**
 * check implementation with manifest
 * @param manifest the API manifest
 * @param impl the implementation
 * @returns impl
 */
export function checkApiImpl(manifest, impl) {
    return impl;
}
/**
 * create API bridge between RENDERER process caller and MAIN process callee
 * @param manifest API manifest
 * @param channel the channel to use
 */
export function createR2MApi(channel, manifest) {
    return new R2MAPIm(channel, manifest);
}
/**
 * create API bridge between MAIN process caller and RENDERER process callee
 * @param manifest API manifest
 * @param channel the channel to use, **notice**: `${channel}-${new Date().getTime()}` channels are used for API reply
 */
export function createM2RApi(channel, manifest) {
    return new M2RAPIm(channel, manifest);
}
/**
 * create API bridge between RENDERER process caller and MAIN process callee
 *
 * **generic type required**
 * @param channel the channel to use
 */
export function createR2MApiTs(channel) {
    return new R2MAPI(channel);
}
/**
 * create API bridge between MAIN process caller and RENDERER process callee
 *
 * **generic type required**
 * @param channel the channel to use, **notice**: `${channel}-${new Date().getTime()}` channels are used for API reply
 */
export function createM2RApiTs(channel) {
    return new M2RAPI(channel);
}
