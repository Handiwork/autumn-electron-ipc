import { IPCManifest, API, ClientAPI } from "./types";
import { R2MAPIm, M2RAPIm, R2MAPI, M2RAPI } from "./api";
/**
 * check manifest object and preserve the original type
 * @param manifest
 */
export declare function checkManifest<M extends IPCManifest>(manifest: M): M;
/**
 * check implementation with manifest
 * @param manifest the API manifest
 * @param impl the implementation
 * @returns impl
 */
export declare function checkApiImpl<M extends IPCManifest, I extends API<M>>(manifest: M, impl: I): I;
/**
 * create API bridge between RENDERER process caller and MAIN process callee
 * @param manifest API manifest
 * @param channel the channel to use
 */
export declare function createR2MApi<T extends IPCManifest>(channel: string, manifest: T): R2MAPIm<API<T>, API<T>, T>;
/**
 * create API bridge between MAIN process caller and RENDERER process callee
 * @param manifest API manifest
 * @param channel the channel to use, **notice**: `${channel}-${new Date().getTime()}` channels are used for API reply
 */
export declare function createM2RApi<T extends IPCManifest>(channel: string, manifest: T): M2RAPIm<API<T>, API<T>, T>;
/**
 * create API bridge between RENDERER process caller and MAIN process callee
 *
 * **generic type required**
 * @param channel the channel to use
 */
export declare function createR2MApiTs<T>(channel: string): R2MAPI<T, ClientAPI<T>>;
/**
 * create API bridge between MAIN process caller and RENDERER process callee
 *
 * **generic type required**
 * @param channel the channel to use, **notice**: `${channel}-${new Date().getTime()}` channels are used for API reply
 */
export declare function createM2RApiTs<T>(channel: string): M2RAPI<T, ClientAPI<T>>;
