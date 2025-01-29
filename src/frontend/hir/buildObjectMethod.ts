import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { makeInstructionId, ObjectMethodInstruction, Place } from "../../ir";
import { buildNode } from "./buildNode";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";

export function buildObjectMethod(
  nodePath: NodePath<t.ObjectMethod>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place {
  // Build the key place
  const keyPath = nodePath.get("key");
  const keyPlace = buildNode(
    keyPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (keyPlace === undefined || Array.isArray(keyPlace)) {
    throw new Error(`Unable to build key place for ${nodePath.type}`);
  }

  const paramPaths = nodePath.get("params");
  const bodyPath = nodePath.get("body");
  const bodyIR = new FunctionIRBuilder(
    paramPaths,
    bodyPath,
    environment,
    moduleBuilder,
  ).build();

  const methodIdentifier = environment.createIdentifier();
  const methodPlace = environment.createPlace(methodIdentifier);
  const methodInstructionId = makeInstructionId(
    functionBuilder.environment.nextInstructionId++,
  );

  functionBuilder.addInstruction(
    new ObjectMethodInstruction(
      methodInstructionId,
      methodPlace,
      nodePath,
      keyPlace,
      bodyIR,
      nodePath.node.computed,
      nodePath.node.generator,
      nodePath.node.async,
      nodePath.node.kind,
    ),
  );

  return methodPlace;
}
