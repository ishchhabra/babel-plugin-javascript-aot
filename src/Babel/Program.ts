import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Codegen } from "../HIR/Codegen";
import { HIRBuilder } from "../HIR/HIRBuilder";
import { Phi } from "../HIR/Phi";
import { constantPropagation } from "../Optimization/ConstantPropagation";
import { functionInlining } from "../Optimization/FunctionInlining";
import { OptimizationOptions } from "../Optimization/OptimizationOptions";

export function compileProgram(
  program: NodePath<t.Program>,
  options: OptimizationOptions,
) {
  const blocks = new HIRBuilder(program).build();
  const phis = new Set<Phi>();

  if (options.enableConstantPropagation) {
    constantPropagation(blocks);
  }

  if (options.enableFunctionInlining) {
    functionInlining(blocks);
  }

  const codegen = new Codegen(blocks, phis);
  return codegen.generate();
}
