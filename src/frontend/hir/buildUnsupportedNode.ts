import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import {
  createInstructionId,
  Place,
  UnsupportedNodeInstruction,
} from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";

export function buildUnsupportedNode(
  nodePath: NodePath<t.Node>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
): Place {
  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instructionId = createInstructionId(environment);

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
