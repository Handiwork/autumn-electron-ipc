import { WebContents } from "electron";
export declare class R2MAPI<S, C> {
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
    getClient(): C;
}
export declare class R2MAPIm<S, C, M> extends R2MAPI<S, C> {
    manifest: M;
    constructor(channel: string, manifest: M);
}
export declare class M2RAPI<S, C> {
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
    getClientFor(webContents: WebContents): C;
}
export declare class M2RAPIm<S, C, M> extends M2RAPI<S, C> {
    manifest: M;
    constructor(channel: string, manifest: M);
}
