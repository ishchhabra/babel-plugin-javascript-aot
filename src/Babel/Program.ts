import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Codegen } from "../Codegen";
import { Environment } from "../Environment";
import { HIRBuilder } from "../HIR";
import { OptimizationPipeline } from "../Optimization/OptimizationPipeline";
import { OptimizationOptions } from "../Optimization/OptimizationPipeline/OptimizationOptions";
import { PhiBuilder, eliminatePhis } from "../SSA";

export function compileProgram(
  program: NodePath<t.Program>,
  options: OptimizationOptions,
) {
  const environment = new Environment();

  const { blocks, bindings } = new HIRBuilder(program, environment).build();
  const phis = new PhiBuilder(bindings, blocks).build();

  new OptimizationPipeline(environment, options).run(bindings, blocks);

  eliminatePhis(bindings, blocks, phis);
  return new Codegen(blocks).generate();
}
