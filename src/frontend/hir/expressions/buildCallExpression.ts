import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { CallExpressionInstruction, Place } from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildCallExpression(
  expressionPath: NodePath<t.CallExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place {
  const calleePath = expressionPath.get("callee");
  if (!calleePath.isExpression()) {
    throw new Error(`Unsupported callee type: ${calleePath.type}`);
  }

  const calleePlace = buildNode(
    calleePath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (calleePlace === undefined || Array.isArray(calleePlace)) {
    throw new Error("Call expression callee must be a single place");
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
      throw new Error("Call expression argument must be a single place");
    }

    return argumentPlace;
  });

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    CallExpressionInstruction,
    place,
    expressionPath,
    calleePlace,
    argumentPlaces,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
