import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { castArray } from "lodash-es";
import { Environment } from "../../../environment";
import {
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
  environment: Environment,
): Place[] | undefined {
  const expressionPath = nodePath.get("expression");
  const expressionPlace = buildNode(
    expressionPath,
    functionBuilder,
    moduleBuilder,
    environment,
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

      const identifier = environment.createIdentifier();
      const place = environment.createPlace(identifier);
      const instruction = environment.createInstruction(
        ExpressionStatementInstruction,
        place,
        expressionPath,
        expressionPlace,
      );
      functionBuilder.addInstruction(instruction);
      return place;
    })
    .filter((place) => place !== undefined);

  return places;
}
