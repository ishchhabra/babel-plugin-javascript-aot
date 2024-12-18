import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Codegen } from "../HIR/Codegen";
import { HIRBuilder } from "../HIR/HIRBuilder";
import { constantPropagation } from "../Optimization/ConstantPropagation";
import { functionInlining } from "../Optimization/FunctionInlining";
import { OptimizationOptions } from "../Optimization/OptimizationOptions";

export function compileProgram(
  program: NodePath<t.Program>,
  options: OptimizationOptions,
) {
  const builder = new HIRBuilder(program).build();

  if (options.enableConstantPropagation) {
    constantPropagation(builder.blocks);
  }

  if (options.enableFunctionInlining) {
    functionInlining(builder.blocks);
  }

  const codegen = new Codegen(builder.blocks, builder.phis);
  return codegen.generate();
}
