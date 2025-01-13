import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  makeInstructionId,
  StoreLocalInstruction,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildNode } from "../buildNode";

export function buildAssignmentExpression(
  nodePath: NodePath<t.AssignmentExpression>,
  builder: HIRBuilder,
) {
  const leftPath: NodePath<t.OptionalMemberExpression | t.LVal> =
    nodePath.get("left");
  leftPath.assertIdentifier();

  const declarationId = builder.getDeclarationId(leftPath.node.name, nodePath);
  if (declarationId === undefined) {
    throw new Error(
      `Variable accessed before declaration: ${leftPath.node.name}`,
    );
  }

  const lvalIdentifier = createIdentifier(builder.environment, declarationId);
  const lvalPlace = createPlace(lvalIdentifier, builder.environment);

  const rightPath = nodePath.get("right");
  const rightPlace = buildNode(rightPath, builder);
  if (rightPlace === undefined || Array.isArray(rightPlace)) {
    throw new Error("Assignment expression right must be a single place");
  }

  // Create a new place for this assignment using the same declarationId
  const identifier = createIdentifier(builder.environment, declarationId);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );

  builder.registerDeclarationPlace(declarationId, lvalPlace);

  builder.currentBlock.instructions.push(
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
