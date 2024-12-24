import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Codegen } from "../Codegen";
import { HIRBuilder } from "../HIR";
import { constantPropagation } from "../Optimization/ConstantPropagation";
import { functionInlining } from "../Optimization/FunctionInlining";
import { OptimizationOptions } from "../Optimization/OptimizationOptions";
import { PhiBuilder, eliminatePhis } from "../SSA";

export function compileProgram(
  program: NodePath<t.Program>,
  options: OptimizationOptions,
) {
  const { blocks, bindings } = new HIRBuilder(program).build();
  const phis = new PhiBuilder(bindings, blocks).build();

  if (options.enableConstantPropagation) {
    constantPropagation(blocks);
  }

  if (options.enableFunctionInlining) {
    functionInlining(blocks);
  }

  eliminatePhis(bindings, blocks, phis);
  return new Codegen(blocks).generate();
}
