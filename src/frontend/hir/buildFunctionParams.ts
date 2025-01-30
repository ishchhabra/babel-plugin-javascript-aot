import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { BindingIdentifierInstruction, Place } from "../../ir";
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
      const instruction = environment.createInstruction(
        BindingIdentifierInstruction,
        place,
        paramPath,
        identifier.name,
      );
      functionBuilder.header.push(instruction);

      const declarationId = identifier.declarationId;
      functionBuilder.registerDeclarationName(name, declarationId, bodyPath);
      functionBuilder.registerDeclarationPlace(declarationId, place);
      return place;
    },
  );
}
