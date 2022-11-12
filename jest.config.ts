/* eslint-disable jest/no-jest-import */
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  collectCoverageFrom: [
    "src/**/*.ts*",
    "!src/core/protocol.ts",
    "!src/core/remote-proxy.ts",
  ],
  coverageProvider: "v8",
  roots: ["./src"],
  transform: {
    "\\.tsx?$": ["ts-jest", { esModuleInterop: true }],
  },
};
export default config;
