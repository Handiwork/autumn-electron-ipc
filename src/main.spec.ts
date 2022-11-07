import type { ResolveRequest } from "./core/protocol";
import { createGPort } from "./main";

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
