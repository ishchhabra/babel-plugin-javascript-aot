import pluginTester from "babel-plugin-tester";
import BabelPlugin from "../../../../src/index";

pluginTester({
  plugin: BabelPlugin,
  pluginOptions: {
    enableFunctionInlining: true,
  },
  pluginName: "javascript-aot",
  fixtures: "./",
});
