import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import {
  BindingIdentifierInstruction,
  createInstructionId,
  Place,
} from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";

export function buildFunctionParams(
  paramPaths: NodePath<t.Identifier | t.RestElement | t.Pattern>[],
  bodyPath: NodePath,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
): Place[] {
  return paramPaths.map(
    (paramPath: NodePath<t.Identifier | t.RestElement | t.Pattern>) => {
      paramPath.assertIdentifier();

      const name = paramPath.node.name;
      const identifier = environment.createIdentifier();
      const place = environment.createPlace(identifier);
      const instructionId = createInstructionId(environment);
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
