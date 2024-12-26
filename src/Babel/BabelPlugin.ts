import type * as BabelCore from "@babel/core";
import { OptimizationOptions } from "../Optimization/OptimizationPipeline/OptimizationOptions";
import { compileProgram } from "./Program";

export default function BabelPlugin(): BabelCore.PluginObj {
  return {
    name: "javascript-aot",
    visitor: {
      Program(program, pass) {
        const pluginOptions = pass.opts as OptimizationOptions;
        const result = compileProgram(program, pluginOptions);
        program.replaceWith(result);
        program.skip();
      },
    },
  };
}
