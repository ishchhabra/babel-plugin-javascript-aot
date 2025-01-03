import { PluginOptions as BabelPluginOptions, NodePath } from "@babel/core";
import { Program } from "@babel/types";
import { CFGBuilder } from "../cfg";
import { CodeGenerator } from "../codegen/CodeGenerator";
import { HIRBuilder } from "../hir";
import { LateOptimizer } from "../late-optimizer/LateOptimizer";
import { PluginOptionsSchema } from "../schemas/plugin-options";
import { SSABuilder } from "../ssa/SSABuilder";
import { SSAEliminator } from "../ssa/SSAEliminator";
import { Environment } from "./environment";

export class Compiler {
  compileProgram(
    program: NodePath<Program>,
    pluginOptions: BabelPluginOptions
  ) {
    const options = PluginOptionsSchema.parse(pluginOptions);

    const environment = new Environment();
    const { blocks } = new HIRBuilder(program, environment).build();
    const { predecessors, backEdges, postOrder } = new CFGBuilder(
      environment,
      blocks
    ).build();

    const { phis } = new SSABuilder(predecessors, environment).build();
    const ssaEliminatorResult = new SSAEliminator(
      environment,
      blocks,
      phis
    ).eliminate();
    const lateOptimizerResult = new LateOptimizer(
      options,
      environment,
      ssaEliminatorResult.blocks,
      postOrder
    ).optimize();
    const generator = new CodeGenerator(lateOptimizerResult.blocks, backEdges);
    const code = generator.generate();

    return code;
  }
}
