const ports = [
  { on: jest.fn(), start: jest.fn() },
  { on: jest.fn(), start: jest.fn() },
];
class MockMessageChannelMain {
  port1 = ports[0];
  port2 = ports[1];
}
jest.mock("electron", () => ({
  MessageChannelMain: MockMessageChannelMain,
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
    let destroy: any;
    const mockSender = {
      postMessage: jest.fn(),
      on(event: string, listener: () => void) {
        expect(event).toBe("destroyed");
        destroy = listener;
      },
    };
    let connect: any;
    const mockIpcMain = {
      on(channel: string, handler: (event: any) => void) {
        expect(channel).toBe(IPC_CHANNEL);
        connect = () => {
          handler({ sender: mockSender });
        };
      },
      send: jest.fn(),
    };

    const connectListener = jest.fn();
    const destroyListener = jest.fn();
    const server = new IPCServer();
    server.onConnect(connectListener);
    server.onDestroy(destroyListener);
    server.setImpl({});
    server.listen(mockIpcMain as any);

    connect();
    expect(connectListener.mock.calls.length).toBe(1);

    expect(server.getProxyOf(mockSender as any)).not.toBeUndefined();

    destroy();
    expect(destroyListener.mock.calls.length).toBe(1);

    expect(server.getProxyOf(mockSender as any)).toBeUndefined();
  });

  it("shold work correctly if no listener specified", () => {
    let destroy: any;
    const mockSender = {
      postMessage: jest.fn(),
      on(event: string, listener: () => void) {
        expect(event).toBe("destroyed");
        destroy = listener;
      },
    };
    let connect: any;
    const mockIpcMain = {
      on(channel: string, handler: (event: any) => void) {
        expect(channel).toBe(IPC_CHANNEL);
        connect = () => {
          handler({ sender: mockSender });
        };
      },
      send: jest.fn(),
    };

    const server = new IPCServer();
    server.setImpl({});
    server.listen(mockIpcMain as any);

    connect();

    expect(server.getProxyOf(mockSender as any)).not.toBeUndefined();

    destroy();

    expect(server.getProxyOf(mockSender as any)).toBeUndefined();
  });
});
