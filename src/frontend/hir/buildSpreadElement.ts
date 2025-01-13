import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  makeInstructionId,
  Place,
  SpreadElementInstruction,
} from "../../ir";
import { HIRBuilder } from "../HIRBuilder";
import { buildNode } from "./buildNode";

export function buildSpreadElement(
  nodePath: NodePath<t.SpreadElement>,
  builder: HIRBuilder,
): Place {
  const argumentPath = nodePath.get("argument");
  const argumentPlace = buildNode(argumentPath, builder);
  if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
    throw new Error("Spread element argument must be a single place");
  }

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );

  builder.currentBlock.instructions.push(
    new SpreadElementInstruction(instructionId, place, nodePath, argumentPlace),
  );

  return place;
}
