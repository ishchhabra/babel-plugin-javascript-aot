import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { ExportDefaultDeclarationInstruction } from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildExportDefaultDeclaration(
  nodePath: NodePath<t.ExportDefaultDeclaration>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const declarationPath = nodePath.get("declaration");
  const declarationPlace = buildNode(
    declarationPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (declarationPlace === undefined || Array.isArray(declarationPlace)) {
    throw new Error("Export default declaration must be a single place");
  }

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    ExportDefaultDeclarationInstruction,
    place,
    nodePath,
    declarationPlace,
  );
  functionBuilder.addInstruction(instruction);

  functionBuilder.environment.declToDeclInstrPlace.set(
    declarationPlace.identifier.declarationId,
    place.id,
  );
  moduleBuilder.exports.set("default", {
    instruction,
    declaration: functionBuilder.getDeclarationInstruction(
      declarationPlace.identifier.declarationId,
    )!,
  });
  return place;
}
