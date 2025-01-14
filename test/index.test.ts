import { testFixtures } from "./testFixtures";

const __dirname = new URL(".", import.meta.url).pathname;

describe("frontend", () => {
  testFixtures(__dirname);
});
