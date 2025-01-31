import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { ExportSpecifierInstruction, Place } from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";
import { buildNode } from "./buildNode";

export function buildExportSpecifier(
  nodePath: NodePath<t.ExportSpecifier>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place {
  const localPath = nodePath.get("local");
  const localPlace = buildNode(
    localPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (localPlace === undefined || Array.isArray(localPlace)) {
    throw new Error("Export specifier local must be a single place");
  }

  const localName = getLocalName(nodePath);
  const exportedName = getExportedName(nodePath);

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    ExportSpecifierInstruction,
    place,
    nodePath,
    localName,
    exportedName,
  );
  functionBuilder.addInstruction(instruction);

  const declarationId = functionBuilder.getDeclarationId(localName, nodePath)!;
  const declarationInstructionId =
    environment.getDeclarationInstruction(declarationId)!;
  moduleBuilder.exports.set(exportedName, {
    instruction,
    declaration: environment.instructions.get(declarationInstructionId)!,
  });
  return place;
}

function getLocalName(nodePath: NodePath<t.ExportSpecifier>) {
  return nodePath.node.local.name;
}

function getExportedName(nodePath: NodePath<t.ExportSpecifier>) {
  const exportedNode = nodePath.node.exported;
  if (t.isIdentifier(exportedNode)) {
    return exportedNode.name;
  }

  return exportedNode.value;
}
