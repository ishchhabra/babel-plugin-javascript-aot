import pluginTester from "babel-plugin-tester";
import BabelPlugin from "../../../src/index";

pluginTester({
  plugin: BabelPlugin,
  pluginOptions: {
    enableConstantPropagation: true,
  },
  pluginName: "javascript-aot",
  fixtures: "./",
});
