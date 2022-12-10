import { IPCClient } from "./renderer";

it("create IPCClient should work", () => {
  const mockPort = {
    postMessage: jest.fn(),
    on: jest.fn(),
    start: jest.fn(),
  };
  const client = new IPCClient<unknown, { a: number }>(mockPort);
  expect(mockPort.on.mock.calls.length).toBe(1);
  client.setImpl({});
  client.proxy.$a;
  expect(mockPort.postMessage.mock.calls.length).toBe(1);
  expect(mockPort.start.mock.calls.length).toBe(1);
});
