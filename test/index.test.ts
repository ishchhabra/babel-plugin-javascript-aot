import pluginTester from "babel-plugin-tester";
import BabelPlugin from "../src/babel-plugin";

pluginTester({
  plugin: BabelPlugin,
  pluginOptions: {
    enableLoadStoreForwardingPass: false,
    enableLateDeadCodeEliminationPass: false,
  },
  pluginName: "javascript-aot",
  fixtures: "./fixtures",
});
