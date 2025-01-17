import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createInstructionId,
  createPlace,
  Place,
  SpreadElementInstruction,
} from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";
import { buildNode } from "./buildNode";

export function buildSpreadElement(
  nodePath: NodePath<t.SpreadElement>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
): Place {
  const argumentPath = nodePath.get("argument");
  const argumentPlace = buildNode(argumentPath, functionBuilder, moduleBuilder);
  if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
    throw new Error("Spread element argument must be a single place");
  }

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);
  const instructionId = createInstructionId(functionBuilder.environment);

  functionBuilder.currentBlock.instructions.push(
    new SpreadElementInstruction(instructionId, place, nodePath, argumentPlace),
  );

  return place;
}
