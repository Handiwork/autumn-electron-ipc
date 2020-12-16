import { IPCManifest, API } from "./types";
/**
 * check implementation with manifest
 * @param manifest the API manifest
 * @param impl the implementation
 * @returns impl
 */
export declare function checkApiImpl<M extends IPCManifest, I extends API<M>>(manifest: M, impl: I): I;
/**
 * check manifest object and preserve the original type
 * @param manifest
 */
export declare function checkManifest<M extends IPCManifest>(manifest: M): M;
