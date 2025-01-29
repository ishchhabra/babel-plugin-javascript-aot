import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { createInstructionId, ReturnTerminal } from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
import { buildNode } from "../buildNode";

export function buildReturnStatement(
  nodePath: NodePath<t.ReturnStatement>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const argument = nodePath.get("argument");
  if (!argument.hasNode()) {
    return;
  }

  const valuePlace = buildNode(
    argument,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (valuePlace === undefined || Array.isArray(valuePlace)) {
    throw new Error("Return statement argument must be a single place");
  }

  functionBuilder.currentBlock.terminal = new ReturnTerminal(
    createInstructionId(functionBuilder.environment),
    valuePlace,
  );
  return undefined;
}
