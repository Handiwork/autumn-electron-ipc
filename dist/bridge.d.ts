import { IPCManifest } from "./types";
import { R2MAPIm, M2RAPIm, R2MAPI, M2RAPI } from "./api";
/**
 * create API bridge between RENDERER process caller and MAIN process callee
 * @param manifest API manifest
 * @param channel the channel to use
 */
export declare function createR2MApi<M extends IPCManifest>(channel: string, manifest: M): R2MAPIm<M>;
/**
 * create API bridge between MAIN process caller and RENDERER process callee
 * @param manifest API manifest
 * @param channel the channel to use
 */
export declare function createM2RApi<M extends IPCManifest>(channel: string, manifest: M): M2RAPIm<M>;
/**
 * create API bridge between RENDERER process caller and MAIN process callee
 *
 * **generic type required**
 * @param channel the channel to use
 */
export declare function createR2MApiTs<T>(channel: string): R2MAPI<T>;
/**
 * create API bridge between MAIN process caller and RENDERER process callee
 *
 * **generic type required**
 * @param channel the channel to use
 */
export declare function createM2RApiTs<T>(channel: string): M2RAPI<T>;
