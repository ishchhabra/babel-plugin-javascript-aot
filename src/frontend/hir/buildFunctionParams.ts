import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import {
  BindingIdentifierInstruction,
  createIdentifier,
  createInstructionId,
  createPlace,
  Place,
} from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";

export function buildFunctionParams(
  paramPaths: NodePath<t.Identifier | t.RestElement | t.Pattern>[],
  bodyPath: NodePath,
  functionBuilder: FunctionIRBuilder,
): Place[] {
  return paramPaths.map(
    (paramPath: NodePath<t.Identifier | t.RestElement | t.Pattern>) => {
      paramPath.assertIdentifier();

      const name = paramPath.node.name;
      const identifier = createIdentifier(functionBuilder.environment);
      const place = createPlace(identifier, functionBuilder.environment);
      const instructionId = createInstructionId(functionBuilder.environment);
      functionBuilder.header.push(
        new BindingIdentifierInstruction(
          instructionId,
          place,
          paramPath,
          identifier.name,
        ),
      );

      const declarationId = identifier.declarationId;
      functionBuilder.registerDeclarationName(name, declarationId, bodyPath);
      functionBuilder.registerDeclarationPlace(declarationId, place);
      return place;
    },
  );
}
