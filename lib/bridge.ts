import { IPCManifest, API, ClientAPI } from "./types"
import { R2MAPIm, M2RAPIm, R2MAPI, M2RAPI } from "./api"

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
 * @param channel the channel to use
 */
export function createM2RApi<M extends IPCManifest>(channel: string, manifest: M) {
    return new M2RAPIm<API<M>, API<M>, M>(channel, manifest)
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
 * @param channel the channel to use
 */
export function createM2RApiTs<T>(channel: string) {
    return new M2RAPI<T, ClientAPI<T>>(channel)
}