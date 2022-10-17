export interface APCMain<Local, Remote> {
  listen(): void;
  on(
    event: "connect",
    callback: (connection: Connection<Local, Remote>) => void
  ): void;
}

export interface APCRenderer<Local, Remote> {
  connect(): Promise<Connection<Local, Remote>>;
}

export interface Connection<L, R> {
  mount<K extends keyof L>(path: K, value: L[K]): Promise<boolean>;

  remote: Remote<R>;
}

export type Remote<T> = T extends Record<string, unknown>
  ? {
      [x in keyof T]: Remote<T[x]>;
    }
  : unknown;
