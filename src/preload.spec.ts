let currentChannel: string;
let response: any;

const mockPort = {
  onmessage: null as any,
  postMessage: jest.fn(),
};
const mockIpcRenderer = {
  on(channel: string, handler: (event: any) => void) {
    currentChannel = channel;
    response = () => {
      handler({ ports: [mockPort] });
    };
  },
  send: jest.fn(),
};
jest.mock("electron", () => ({
  ipcRenderer: mockIpcRenderer,
}));

import { IPC_CHANNEL } from "./constants";
import type { Message, ResolveRequest } from "./core/protocol";
import { connect, createGPort } from "./preload";

it("createGPort should work", () => {
  const mockPort = {
    onmessage: null as any,
    postMessage: jest.fn(),
    start: jest.fn(),
  };

  const gport = createGPort(mockPort as any);
  gport.start();
  const msg: ResolveRequest = { key: 0, type: "resolve", path: "" };
  gport.postMessage(msg);
  expect(mockPort.postMessage.mock.calls[0][0]).toBe(msg);
  expect(mockPort.start.mock.calls.length).toBe(1);

  let result: any;
  function callback(message: Message) {
    result = message;
  }
  gport.on("message", callback);
  mockPort.onmessage({ data: msg });
  expect(result).toBe(msg);
});

it("connect should work if receive remote port", async () => {
  const pGPort = connect();
  response();
  expect(currentChannel).toBe(IPC_CHANNEL);
  await expect(pGPort).resolves.not.toBeFalsy();
});

it("should throw if timeout", async () => {
  const pGPort = connect();
  setTimeout(response, 1100);
  await expect(pGPort).rejects.toBe("timeout");
});
