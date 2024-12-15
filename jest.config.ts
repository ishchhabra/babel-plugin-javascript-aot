import type { Config } from "jest";

const config: Config = {
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest", {}],
  },
  transformIgnorePatterns: ["node_modules"],
  extensionsToTreatAsEsm: [".ts"],
  testEnvironment: "jest-environment-node",
};

export default config;
