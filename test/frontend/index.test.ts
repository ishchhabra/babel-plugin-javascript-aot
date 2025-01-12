import { testFixtures } from "../textFixtures";

const __dirname = new URL(".", import.meta.url).pathname;

describe("frontend", () => {
  testFixtures(__dirname, {
    enableConstantPropagationPass: false,
    enableLoadStoreForwardingPass: false,
    enableLateDeadCodeEliminationPass: false,
  });
});
