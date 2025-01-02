import pluginTester from "babel-plugin-tester";
import BabelPlugin from "../src/babel-plugin";

pluginTester({
  plugin: BabelPlugin,
  pluginOptions: {},
  pluginName: "javascript-aot",
  fixtures: "./fixtures",
});
