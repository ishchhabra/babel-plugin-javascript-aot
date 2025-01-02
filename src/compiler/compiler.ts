import { NodePath, PluginOptions } from "@babel/core";
import { Program } from "@babel/types";
import { CFGBuilder } from "../cfg";
import { CodeGenerator } from "../codegen/CodeGenerator";
import { HIRBuilder } from "../hir";
import { SSABuilder } from "../ssa/SSABuilder";
import { SSAEliminator } from "../ssa/SSAEliminator";
import { Environment } from "./environment";

export class Compiler {
  compileProgram(program: NodePath<Program>, options: PluginOptions) {
    const environment = new Environment();
    const { blocks } = new HIRBuilder(program, environment).build();
    const { predecessors, backEdges } = new CFGBuilder(
      environment,
      blocks
    ).build();

    const { phis } = new SSABuilder(predecessors, environment).build();
    new SSAEliminator(environment, blocks, phis).eliminate();
    const generator = new CodeGenerator(blocks, backEdges);
    const code = generator.generate();

    return code;
  }
}
