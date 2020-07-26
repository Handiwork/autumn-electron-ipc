import { IPCManifest, API, ClientAPI } from "."
import { R2MAPIm, M2RAPIm, R2MAPI, M2RAPI } from "./api"

/**
 * check manifest object and preserve the original type
 * @param manifest 
 */
export function checkManifest<M extends IPCManifest>(manifest: M) {
    return manifest
}

/**
 * check implementation with manifest
 * @param manifest the API manifest
 * @param impl the implementation
 * @returns impl
 */
export function checkApiImpl<M extends IPCManifest, I extends API<M>>(manifest: M, impl: I) {
    return impl
}

/**
 * create API bridge between RENDERER process caller and MAIN process callee
 * @param manifest API manifest
 * @param channel the channel to use
 */
export function createR2MApi<T extends IPCManifest>(channel: string, manifest: T) {
    return new R2MAPIm<API<T>, API<T>, T>(channel, manifest)
}

/**
 * create API bridge between MAIN process caller and RENDERER process callee
 * @param manifest API manifest
 * @param channel the channel to use, **notice**: `${channel}-${new Date().getTime()}` channels are used for API reply
 */
export function createM2RApi<T extends IPCManifest>(channel: string, manifest: T) {
    return new M2RAPIm<API<T>, API<T>, T>(channel, manifest)
}

/**
 * create API bridge between RENDERER process caller and MAIN process callee
 * 
 * **generic type required** 
 * @param channel the channel to use
 */
export function createR2MApiTs<T>(channel: string) {
    return new R2MAPI<T, ClientAPI<T>>(channel)
}

/**
 * create API bridge between MAIN process caller and RENDERER process callee
 * 
 * **generic type required** 
 * @param channel the channel to use, **notice**: `${channel}-${new Date().getTime()}` channels are used for API reply
 */
export function createM2RApiTs<T>(channel: string) {
    return new M2RAPI<T, ClientAPI<T>>(channel)
}