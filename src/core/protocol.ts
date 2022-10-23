export interface SerializedArgs {
  raw: any[];
  callbacks: { pos: number; key: string }[];
}

export interface RequestBase {
  key: number;
  type: string;
  path: string;
}

export interface ResolveRequest extends RequestBase {
  type: "resolve";
}

export interface FunctionRequest extends RequestBase {
  type: "function";
  args: SerializedArgs;
}

export interface UnmountRequest extends RequestBase {
  type: "unmount";
}

export type Request = ResolveRequest | FunctionRequest | UnmountRequest;

export interface ResponseBase {
  ans: number;
  data?: any;
  error: any;
}

export interface ResolveResponse extends ResponseBase {
  type: "resolve-";
}

export interface FunctionResponse extends ResponseBase {
  type: "function-";
}

export interface UnmountResponse extends ResponseBase {
  type: "unmount-";
}

export type Response = ResolveResponse | FunctionResponse | UnmountResponse;

export type Message = Request | Response;

export interface GPort {
  postMessage(msg: Message): void;
  on(event: "message", listener: (msg: Message) => void): void;
}
