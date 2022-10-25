import { buildChannelName, IPC_CHANNEL } from "./constants";

it("channel name should be constant if no salt is provided", () => {
  expect(buildChannelName()).toBe(IPC_CHANNEL);
});
