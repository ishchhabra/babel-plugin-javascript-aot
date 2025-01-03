import { NodePath, PluginOptions } from "@babel/core";
import { Program } from "@babel/types";
import { CFGBuilder } from "../cfg";
import { CodeGenerator } from "../codegen/CodeGenerator";
import { HIRBuilder } from "../hir";
import { LateOptimizer } from "../late-optimizer/LateOptimizer";
import { SSABuilder } from "../ssa/SSABuilder";
import { SSAEliminator } from "../ssa/SSAEliminator";
import { Environment } from "./environment";

export class Compiler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO: Remove this.
  compileProgram(program: NodePath<Program>, options: PluginOptions) {
    const environment = new Environment();
    const { blocks } = new HIRBuilder(program, environment).build();
    const { predecessors, backEdges } = new CFGBuilder(
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
      environment,
      ssaEliminatorResult.blocks
    ).optimize();
    const generator = new CodeGenerator(lateOptimizerResult.blocks, backEdges);
    const code = generator.generate();

    return code;
  }
}
