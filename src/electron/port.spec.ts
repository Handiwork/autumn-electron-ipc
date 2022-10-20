import { MessageChannelMain } from "electron";
import type { FunctionRequest } from "../protocol";
import { createGPort } from "./port";

jest.mock("electron", () => {
  class MockMessageChannelMain {
    port1 = {
      postMessage: jest.fn(),
      on: jest.fn(),
    };
  }
  const mElectron = { MessageChannelMain: MockMessageChannelMain };
  return mElectron;
});

it("postMessage should work", () => {
  const { port1 } = new MessageChannelMain();
  const port = createGPort(port1);
  const message: FunctionRequest = {
    key: 0,
    type: "function",
    path: "IMPL",
    args: { raw: [], callbacks: [] },
  };
  port.postMessage(message);
  expect(
    (port1.postMessage as jest.MockedFunction<typeof port.postMessage>).mock
      .calls[0][0]
  ).toBe(message);
});

it("on message should work", () => {
  const { port1 } = new MessageChannelMain();
  const port = createGPort(port1);
  const message: FunctionRequest = {
    key: 0,
    type: "function",
    path: "IMPL",
    args: { raw: [], callbacks: [] },
  };
  port.on("message", (msg) => {
    expect(msg).toBe(message);
  });
  expect((port1.on as jest.MockedFunction<any>).mock.calls[0][0]).toBe(
    "message"
  );
  // (messageEvent: Electron.MessageEvent) => void
  // run callback
  (port1.on as jest.MockedFunction<any>).mock.calls[0][1]({ data: message });
});
