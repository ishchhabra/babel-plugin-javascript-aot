import pluginTester from "babel-plugin-tester";
import BabelPlugin from "../../../src/index";

pluginTester({
  plugin: BabelPlugin,
  pluginOptions: {},
  pluginName: "javascript-aot",
  fixtures: "./Phi",
});
