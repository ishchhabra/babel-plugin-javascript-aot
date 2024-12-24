import pluginTester from "babel-plugin-tester";
import BabelPlugin from "../../../src/index";

let currentFixturePath: string | undefined;

pluginTester({
  plugin: BabelPlugin,
  pluginOptions: {},
  pluginName: "javascript-aot",
  fixtures: "./Phi/basic",
  formatResult: (code, options) => {
    if (options?.cwd) {
      currentFixturePath = options.cwd;
    }
    return code;
  },
  // setup: () => {
  //   return async () => {
  //     if (!currentFixturePath) {
  //       throw new Error("Current fixture path is undefined.");
  //     }

  //     await compareFixtureLogs(currentFixturePath);
  //   };
  // },
});
