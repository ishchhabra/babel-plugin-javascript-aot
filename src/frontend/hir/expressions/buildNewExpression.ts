import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { Place } from "../../../ir";
import { NewExpressionInstruction } from "../../../ir/instructions/value/NewExpression";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildNewExpression(
  expressionPath: NodePath<t.NewExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place {
  const calleePath = expressionPath.get("callee");
  if (!calleePath.isExpression()) {
    throw new Error(
      `Unsupported new expression callee type: ${calleePath.type}`,
    );
  }

  const calleePlace = buildNode(
    calleePath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (calleePlace === undefined || Array.isArray(calleePlace)) {
    throw new Error("New expression callee must be a single place");
  }

  const argumentsPath = expressionPath.get("arguments");
  const argumentPlaces = argumentsPath.map((argumentPath) => {
    const argumentPlace = buildNode(
      argumentPath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
    if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
      throw new Error("New expression argument must be a single place");
    }

    return argumentPlace;
  });

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    NewExpressionInstruction,
    place,
    expressionPath,
    calleePlace,
    argumentPlaces,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
