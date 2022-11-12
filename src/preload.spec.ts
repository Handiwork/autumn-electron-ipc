import { IPC_CHANNEL } from "./constants";
import type { Message, ResolveRequest } from "./core/protocol";
import { connect, createGPort } from "./preload";

it("createGPort should work", () => {
  const mockPort = {
    onmessage: null as any,
    postMessage: jest.fn(),
  };

  const gport = createGPort(mockPort as any);
  const msg: ResolveRequest = { key: 0, type: "resolve", path: "" };
  gport.postMessage(msg);
  expect(mockPort.postMessage.mock.calls[0][0]).toBe(msg);

  let result: any;
  function callback(message: Message) {
    result = message;
  }
  gport.on("message", callback);
  mockPort.onmessage({ data: msg });
  expect(result).toBe(msg);
});

it("connect should work if receive remote port", async () => {
  const mockPort = {
    onmessage: null as any,
    postMessage: jest.fn(),
  };
  const mockIpcRenderer = {
    on(channel: string, handler: (event: any) => void) {
      expect(channel).toBe(IPC_CHANNEL);
      setTimeout(() => {
        handler({ ports: [mockPort] });
      }, 100);
    },
    send: jest.fn(),
  };
  const gport = await connect(mockIpcRenderer as any);
  expect(gport).not.toBeFalsy();
});

it("should throw if timeout", async () => {
  const mockPort = {
    onmessage: null as any,
    postMessage: jest.fn(),
  };
  const mockIpcRenderer = {
    on(channel: string, handler: (event: any) => void) {
      expect(channel).toBe(IPC_CHANNEL);
      setTimeout(() => {
        handler({ ports: [mockPort] });
      }, 1100);
    },
    send: jest.fn(),
  };
  const gport = connect(mockIpcRenderer as any);
  await expect(gport).rejects.toBe("timeout");
});
