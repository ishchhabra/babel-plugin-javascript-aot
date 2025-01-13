import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  makeInstructionId,
  Place,
  UnsupportedNodeInstruction,
} from "../../ir";
import { HIRBuilder } from "../HIRBuilder";

export function buildUnsupportedNode(
  nodePath: NodePath<t.Node>,
  builder: HIRBuilder,
): Place {
  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );

  builder.currentBlock.instructions.push(
    new UnsupportedNodeInstruction(
      instructionId,
      place,
      nodePath,
      nodePath.node,
    ),
  );

  return place;
}
