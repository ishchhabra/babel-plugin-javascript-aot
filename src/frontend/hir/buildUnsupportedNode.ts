import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createInstructionId,
  createPlace,
  Place,
  UnsupportedNodeInstruction,
} from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";

export function buildUnsupportedNode(
  nodePath: NodePath<t.Node>,
  functionBuilder: FunctionIRBuilder,
): Place {
  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);
  const instructionId = createInstructionId(functionBuilder.environment);

  functionBuilder.addInstruction(
    new UnsupportedNodeInstruction(
      instructionId,
      place,
      nodePath,
      nodePath.node,
    ),
  );

  return place;
}
