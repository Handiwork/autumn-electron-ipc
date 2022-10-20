export const IPC_CHANNEL = "autumn-electron-ipc-";

export function buildChannelName(salt = "") {
  return IPC_CHANNEL + salt;
}
