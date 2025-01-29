import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { createInstructionId, Place, SpreadElementInstruction } from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";
import { buildNode } from "./buildNode";

export function buildSpreadElement(
  nodePath: NodePath<t.SpreadElement>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place {
  const argumentPath = nodePath.get("argument");
  const argumentPlace = buildNode(
    argumentPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
    throw new Error("Spread element argument must be a single place");
  }

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instructionId = createInstructionId(environment);

  functionBuilder.addInstruction(
    new SpreadElementInstruction(instructionId, place, nodePath, argumentPlace),
  );

  return place;
}
