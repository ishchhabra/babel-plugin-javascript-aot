import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { TemplateLiteralInstruction } from "../../../ir/instructions/value/TemplateLiteral";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildTemplateLiteral(
  nodePath: NodePath<t.TemplateLiteral>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const quasis = nodePath.node.quasis;

  const expressionPaths = nodePath.get("expressions");
  const expressionPlaces = expressionPaths.map((exprPath) => {
    if (!exprPath.isExpression()) {
      throw new Error(
        `Unsupported template literal expression type: ${exprPath.type}`,
      );
    }
    const exprPlace = buildNode(
      exprPath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
    if (exprPlace === undefined || Array.isArray(exprPlace)) {
      throw new Error("Template literal expression must be a single place");
    }
    return exprPlace;
  });

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    TemplateLiteralInstruction,
    place,
    nodePath,
    quasis,
    expressionPlaces,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
