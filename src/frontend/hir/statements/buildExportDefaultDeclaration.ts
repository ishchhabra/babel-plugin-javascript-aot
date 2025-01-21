import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  ExportDefaultDeclarationInstruction,
  makeInstructionId,
} from "../../../ir";
import { buildNode } from "../buildNode";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";

export function buildExportDefaultDeclaration(
  nodePath: NodePath<t.ExportDefaultDeclaration>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
) {
  const declarationPath = nodePath.get("declaration");
  const declarationPlace = buildNode(
    declarationPath,
    functionBuilder,
    moduleBuilder,
  );
  if (declarationPlace === undefined || Array.isArray(declarationPlace)) {
    throw new Error("Export default declaration must be a single place");
  }

  const identifier = createIdentifier(functionBuilder.environment);
  const place = createPlace(identifier, functionBuilder.environment);
  const instructionId = makeInstructionId(
    functionBuilder.environment.nextInstructionId++,
  );

  const instruction = new ExportDefaultDeclarationInstruction(
    instructionId,
    place,
    nodePath,
    declarationPlace,
  );
  functionBuilder.addInstruction(instruction);
  moduleBuilder.exportToInstructions.set("default", instruction);
  return place;
}
