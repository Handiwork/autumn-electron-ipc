export interface SerializedArgs {
  raw: any[];
  callbacks: any[];
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

export interface ReleaseRequest extends RequestBase {
  type: "release";
}

export type Request = ResolveRequest | FunctionRequest | ReleaseRequest;

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

export interface ReleaseResponse extends ResponseBase {
  type: "release-";
}

export type Response = ResolveResponse | FunctionResponse | ReleaseResponse;

export type Message = Request | Response;

export interface GPort {
  postMessage(msg: Message): void;
  on(event: "message", listener: (msg: Message) => void): void;
}
