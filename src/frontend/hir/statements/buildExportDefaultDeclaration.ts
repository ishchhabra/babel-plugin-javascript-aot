import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  createIdentifier,
  createPlace,
  ExportDefaultDeclarationInstruction,
  makeInstructionId,
} from "../../../ir";
import { HIRBuilder } from "../../HIRBuilder";
import { buildNode } from "../buildNode";

export function buildExportDefaultDeclaration(
  nodePath: NodePath<t.ExportDefaultDeclaration>,
  builder: HIRBuilder,
) {
  const declarationPath = nodePath.get("declaration");
  const declarationPlace = buildNode(declarationPath, builder);
  if (declarationPlace === undefined || Array.isArray(declarationPlace)) {
    throw new Error("Export default declaration must be a single place");
  }

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );

  const instruction = new ExportDefaultDeclarationInstruction(
    instructionId,
    place,
    nodePath,
    declarationPlace,
  );
  builder.currentBlock.instructions.push(instruction);
  builder.exportToInstructions.set("default", instruction);
  return place;
}
