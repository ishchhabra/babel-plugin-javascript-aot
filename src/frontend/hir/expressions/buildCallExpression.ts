import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  CallExpressionInstruction,
  createIdentifier,
  createPlace,
  makeInstructionId,
  Place,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildNode } from "../buildNode";

export function buildCallExpression(
  expressionPath: NodePath<t.CallExpression>,
  builder: HIRBuilder,
): Place {
  const calleePath = expressionPath.get("callee");
  if (!calleePath.isExpression()) {
    throw new Error(`Unsupported callee type: ${calleePath.type}`);
  }

  const calleePlace = buildNode(calleePath, builder);
  if (calleePlace === undefined || Array.isArray(calleePlace)) {
    throw new Error("Call expression callee must be a single place");
  }

  const argumentsPath = expressionPath.get("arguments");
  const argumentPlaces = argumentsPath.map((argumentPath) => {
    const argumentPlace = buildNode(argumentPath, builder);
    if (argumentPlace === undefined || Array.isArray(argumentPlace)) {
      throw new Error("Call expression argument must be a single place");
    }

    return argumentPlace;
  });

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );

  builder.currentBlock.instructions.push(
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
