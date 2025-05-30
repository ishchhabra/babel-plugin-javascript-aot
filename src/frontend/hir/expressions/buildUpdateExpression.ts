import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { StoreLocalInstruction } from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
import { buildBinaryExpression } from "./buildBinaryExpression";

export function buildUpdateExpression(
  nodePath: NodePath<t.UpdateExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const argumentPath = nodePath.get("argument");
  if (!argumentPath.isIdentifier()) {
    throw new Error(`Unsupported argument type: ${argumentPath.type}`);
  }

  const declarationId = functionBuilder.getDeclarationId(
    argumentPath.node.name,
    nodePath,
  );
  if (declarationId === undefined) {
    throw new Error(
      `Variable accessed before declaration: ${argumentPath.node.name}`,
    );
  }

  const latestDeclaration = environment.getLatestDeclaration(declarationId)!;
  const originalPlace = environment.places.get(latestDeclaration.placeId);
  if (originalPlace === undefined) {
    throw new Error(
      `Unable to find the place for ${argumentPath.node.name} (${declarationId})`,
    );
  }

  const lvalIdentifier = environment.createIdentifier(declarationId);
  const lvalPlace = environment.createPlace(lvalIdentifier);

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

  const valuePlace = buildBinaryExpression(
    binaryExpressionPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (valuePlace === undefined || Array.isArray(valuePlace)) {
    throw new Error("Update expression value must be a single place");
  }

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    StoreLocalInstruction,
    place,
    nodePath,
    lvalPlace,
    valuePlace,
    "const",
  );
  functionBuilder.addInstruction(instruction);
  environment.registerDeclaration(
    declarationId,
    functionBuilder.currentBlock.id,
    lvalPlace.id,
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
