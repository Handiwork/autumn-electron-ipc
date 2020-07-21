import { WebContents } from "electron";
import { IPCManifest, API } from ".";
/**
 * check manifest object and preserve the original type
 * @param manifest
 */
export declare function checkManifest<T extends IPCManifest>(manifest: T): T;
/**
 * create API bridge between MAIN process caller and RENDERER process callee
 * @param manifest API manifest
 * @param channel the channel to use, default to "ipc-basic-channel",
 * NOTICE:`${channel}-{new Date().getTime()}` channels are used for api reply
 */
export declare function createM2RApi<T extends IPCManifest>(channel: string, manifest: T): {
    manifest: T;
    /**
     * plug bridge in renderer process implementation
     * @param impl the object that implements API
     */
    plugInRenderer(impl: API<T>): void;
    /**
     * get client for target webContents
     * @param win target webContents
     */
    getClientFor(win: WebContents): API<T>;
};
/**
 * create API bridge between renderer process caller and main process callee
 * @param manifest API manifest
 * @param channel the channel to use, default to "ipc-basic-channel"
 */
export declare function createR2MApi<T extends IPCManifest>(channel: string, manifest: T): {
    manifest: T;
    plugInMain(impl: API<T>): void;
    getClient(): API<T>;
};
