import { CompilerOptionsSchema } from "../../src/compile";
import { testFixtures } from "../textFixtures";

const __dirname = new URL(".", import.meta.url).pathname;

describe("frontend", () => {
  testFixtures(
    __dirname,
    CompilerOptionsSchema.parse({
      enableOptimizer: false,
      enableLateOptimizer: false,
    }),
  );
});
