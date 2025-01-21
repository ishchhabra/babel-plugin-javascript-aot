import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  CallExpressionInstruction,
  createIdentifier,
  createPlace,
  makeInstructionId,
  Place,
} from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildCallExpression(
  expressionPath: NodePath<t.CallExpression>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
): Place {
  const calleePath = expressionPath.get("callee");
  if (!calleePath.isExpression()) {
    throw new Error(`Unsupported callee type: ${calleePath.type}`);
  }

  const calleePlace = buildNode(calleePath, functionBuilder, moduleBuilder);
  if (calleePlace === undefined || Array.isArray(calleePlace)) {
    throw new Error("Call expression callee must be a single place");
  }

  const argumentsPath = expressionPath.get("arguments");
  const argumentPlaces = argumentsPath.map((argumentPath) => {
    const argumentPlace = buildNode(
      argumentPath,
      functionBuilder,
      moduleBuilder,
    );
    if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
      throw new Error("Call expression argument must be a single place");
    }

    return argumentPlace;
  });

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);
  const instructionId = makeInstructionId(
    functionBuilder.environment.nextInstructionId++,
  );

  functionBuilder.addInstruction(
    new CallExpressionInstruction(
      instructionId,
      place,
      expressionPath,
      calleePlace,
      argumentPlaces,
    ),
  );

  return place;
}
