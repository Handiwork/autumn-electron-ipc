export const IPC_CHANNEL = "autumn-electron-ipc-";
export const MAIN_KEY = "IMPL";

export function buildChannelName(salt = "") {
  return IPC_CHANNEL + salt;
}
