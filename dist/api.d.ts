import { WebContents } from "electron";
import { API, Client, IPCManifest } from "./types";
export declare class R2MAPI<S> {
    private channel;
    constructor(channel: string);
    /**
     * plug bridge in main process implementation
     * @param impl the object that implements API
     */
    plugInMain<I extends S>(impl: I): void;
    /**
     * get renderer client
     */
    getClient(): Client<S>;
}
export declare class R2MAPIm<M extends IPCManifest> extends R2MAPI<API<M>> {
    manifest: M;
    constructor(channel: string, manifest: M);
}
export declare class M2RAPI<S> {
    private channel;
    constructor(channel: string);
    /**
     * plug bridge in renderer process implementation
     * @param impl the object that implements API
     */
    plugInRenderer<I extends S>(impl: I): void;
    /**
     * get client for target webContents
     * @param webContents target webContents
     */
    getClientFor(webContents: WebContents): Client<S>;
}
export declare class M2RAPIm<M extends IPCManifest> extends M2RAPI<API<M>> {
    manifest: M;
    constructor(channel: string, manifest: M);
}
