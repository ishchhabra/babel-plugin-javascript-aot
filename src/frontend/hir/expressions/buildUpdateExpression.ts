import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  makeInstructionId,
  StoreLocalInstruction,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildBinaryExpression } from "./buildBinaryExpression";

export function buildUpdateExpression(
  nodePath: NodePath<t.UpdateExpression>,
  builder: HIRBuilder,
) {
  const argumentPath = nodePath.get("argument");
  if (!argumentPath.isIdentifier()) {
    throw new Error(`Unsupported argument type: ${argumentPath.type}`);
  }

  const declarationId = builder.getDeclarationId(
    argumentPath.node.name,
    nodePath,
  );
  if (declarationId === undefined) {
    throw new Error(
      `Variable accessed before declaration: ${argumentPath.node.name}`,
    );
  }

  const originalPlace = builder.getLatestDeclarationPlace(declarationId);
  if (originalPlace === undefined) {
    throw new Error(
      `Unable to find the place for ${argumentPath.node.name} (${declarationId})`,
    );
  }

  const lvalIdentifier = createIdentifier(builder.environment, declarationId);
  const lvalPlace = createPlace(lvalIdentifier, builder.environment);

  const rightLiteral = t.numericLiteral(1);
  const isIncrement = nodePath.node.operator === "++";
  const binaryExpression = t.binaryExpression(
    isIncrement ? "+" : "-",
    argumentPath.node,
    rightLiteral,
  );
  const binaryExpressionPath = createSyntheticBinaryPath(
    nodePath,
    binaryExpression,
  );

  const valuePlace = buildBinaryExpression(binaryExpressionPath, builder);
  if (valuePlace === undefined || Array.isArray(valuePlace)) {
    throw new Error("Update expression value must be a single place");
  }

  const identifier = createIdentifier(builder.environment);
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
      valuePlace,
      "const",
    ),
  );

  return nodePath.node.prefix ? valuePlace : originalPlace;
}

function createSyntheticBinaryPath(
  parentPath: NodePath<t.Node>,
  binExpr: t.BinaryExpression,
): NodePath<t.BinaryExpression> {
  const containerNode = t.expressionStatement(binExpr);

  const newPath = NodePath.get({
    hub: parentPath.hub,
    parentPath,
    parent: parentPath.node,
    container: containerNode,
    key: "expression",
  });

  return newPath as NodePath<t.BinaryExpression>;
}
