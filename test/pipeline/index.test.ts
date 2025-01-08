import { testFixtures } from "../textFixtures";

const __dirname = new URL(".", import.meta.url).pathname;

describe("pipeline", () => {
  testFixtures(__dirname, {
    enableConstantPropagationPass: true,
    enableLoadStoreForwardingPass: false,
    enableLateDeadCodeEliminationPass: false,
  });
});
