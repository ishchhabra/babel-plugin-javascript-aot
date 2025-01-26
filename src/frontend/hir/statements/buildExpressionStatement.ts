import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { castArray } from "lodash-es";
import {
  createIdentifier,
  createInstructionId,
  createPlace,
  ExpressionStatementInstruction,
  Place,
  StoreLocalInstruction,
} from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
import { buildNode } from "../buildNode";

export function buildExpressionStatement(
  nodePath: NodePath<t.ExpressionStatement>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
): Place[] | undefined {
  const expressionPath = nodePath.get("expression");
  const expressionPlace = buildNode(
    expressionPath,
    functionBuilder,
    moduleBuilder,
  );
  const expressionPlaces = castArray(expressionPlace);
  const places = expressionPlaces
    .map((expressionPlace) => {
      const expressionInstruction =
        functionBuilder.environment.placeToInstruction.get(expressionPlace.id);
      // For assignments, since we convert them to a memory instruction,
      // we do not need to emit an expression statement instruction.
      if (expressionInstruction instanceof StoreLocalInstruction) {
        return undefined;
      }

      const identifier = createIdentifier(functionBuilder.environment);
      const place = createPlace(identifier, functionBuilder.environment);
      const instructionId = createInstructionId(functionBuilder.environment);

      functionBuilder.addInstruction(
        new ExpressionStatementInstruction(
          instructionId,
          place,
          expressionPath,
          expressionPlace,
        ),
      );

      return place;
    })
    .filter((place) => place !== undefined);

  return places;
}
