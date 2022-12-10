const ports = [
  { on: jest.fn(), start: jest.fn() },
  { on: jest.fn(), start: jest.fn() },
];
class MockMessageChannelMain {
  port1 = ports[0];
  port2 = ports[1];
}

let destroy: any;
const mockSender = {
  id: 1,
  postMessage: jest.fn(),
  currentEvent: "",
  on(event: string, listener: () => void) {
    this.currentEvent = event;
    destroy = listener;
  },
};
let connect: any;
const mockIpcMain = {
  currentChannelName: undefined as any,
  on(channel: string, handler: (event: any) => void) {
    this.currentChannelName = channel;
    connect = () => {
      handler({ sender: mockSender });
    };
  },
  send: jest.fn(),
};

jest.mock("electron", () => ({
  MessageChannelMain: MockMessageChannelMain,
  ipcMain: mockIpcMain,
}));

import { IPC_CHANNEL } from "./constants";
import type { ResolveRequest } from "./core/protocol";
import { createGPort, IPCServer } from "./main";

it("createGPort should work", () => {
  const mockPort = {
    on: jest.fn(),
    postMessage: jest.fn(),
    start: jest.fn(),
  };
  const port = createGPort(mockPort as any);
  const callback = jest.fn();
  port.on("message", callback);
  const msg: ResolveRequest = {
    type: "resolve",
    key: 0,
    path: "",
  };
  port.postMessage(msg);
  expect(mockPort.on.mock.calls[0][0]).toBe("message");
  mockPort.on.mock.calls[0][1]({ data: msg });
  expect(callback.mock.calls[0][0]).toBe(msg);
});

describe("IPCServer", () => {
  it("IPCServer should accept request correctly", () => {
    const connectListener = jest.fn();
    const destroyListener = jest.fn();
    const server = new IPCServer();
    server.setOnConnectListener(connectListener);
    server.setOnDestroyListener(destroyListener);
    server.setImpl({});
    server.listen();

    connect();
    expect(mockIpcMain.currentChannelName).toBe(IPC_CHANNEL);
    expect(connectListener.mock.calls.length).toBe(1);

    expect(server.getProxyOf(mockSender as any)).not.toBeUndefined();

    destroy();
    expect(destroyListener.mock.calls.length).toBe(1);

    expect(server.getProxyOf(mockSender as any)).toBeUndefined();
  });

  it("shold work correctly if no listener specified", () => {
    const server = new IPCServer();
    server.setImpl({});
    server.listen();

    connect();

    expect(server.getProxyOf(mockSender as any)).not.toBeUndefined();

    destroy();

    expect(mockSender.currentEvent).toBe("destroyed");
    expect(server.getProxyOf(mockSender as any)).toBeUndefined();
  });
});
