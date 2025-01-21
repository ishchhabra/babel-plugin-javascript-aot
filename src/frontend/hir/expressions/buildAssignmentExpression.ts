import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  makeInstructionId,
  StoreLocalInstruction,
} from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildAssignmentExpression(
  nodePath: NodePath<t.AssignmentExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
) {
  const leftPath: NodePath<t.OptionalMemberExpression | t.LVal> =
    nodePath.get("left");
  leftPath.assertIdentifier();

  const declarationId = functionBuilder.getDeclarationId(
    leftPath.node.name,
    nodePath,
  );
  if (declarationId === undefined) {
    throw new Error(
      `Variable accessed before declaration: ${leftPath.node.name}`,
    );
  }

  const lvalIdentifier = createIdentifier(
    functionBuilder.environment,
    declarationId,
  );
  const lvalPlace = createPlace(lvalIdentifier, functionBuilder.environment);

  const rightPath = nodePath.get("right");
  const rightPlace = buildNode(rightPath, functionBuilder, moduleBuilder);
  if (rightPlace === undefined || Array.isArray(rightPlace)) {
    throw new Error("Assignment expression right must be a single place");
  }

  // Create a new place for this assignment using the same declarationId
  const identifier = createIdentifier(
    functionBuilder.environment,
    declarationId,
  );
  const place = createPlace(identifier, functionBuilder.environment);
  const instructionId = makeInstructionId(
    functionBuilder.environment.nextInstructionId++,
  );

  functionBuilder.registerDeclarationPlace(declarationId, lvalPlace);

  functionBuilder.addInstruction(
    new StoreLocalInstruction(
      instructionId,
      place,
      nodePath,
      lvalPlace,
      rightPlace,
      "const",
    ),
  );

  return place;
}
