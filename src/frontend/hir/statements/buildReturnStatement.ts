import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { makeInstructionId, ReturnTerminal } from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildNode } from "../buildNode";

export function buildReturnStatement(
  nodePath: NodePath<t.ReturnStatement>,
  builder: HIRBuilder,
) {
  const argument = nodePath.get("argument");
  if (!argument.hasNode()) {
    return;
  }

  const valuePlace = buildNode(argument, builder);
  if (valuePlace === undefined || Array.isArray(valuePlace)) {
    throw new Error("Return statement argument must be a single place");
  }

  builder.currentBlock.terminal = new ReturnTerminal(
    makeInstructionId(builder.environment.nextInstructionId++),
    valuePlace,
  );
  return undefined;
}
