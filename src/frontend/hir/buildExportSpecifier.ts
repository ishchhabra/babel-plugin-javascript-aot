import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import {
  ExportSpecifierInstruction,
  FunctionDeclarationInstruction,
  Place,
  StoreLocalInstruction,
} from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";

export function buildExportSpecifier(
  nodePath: NodePath<t.ExportSpecifier>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place {
  const localName = getLocalName(nodePath);
  const exportedName = getExportedName(nodePath);

  const declarationId = functionBuilder.getDeclarationId(localName, nodePath)!;
  const declarationInstructionId =
    environment.getDeclarationInstruction(declarationId)!;
  const declarationInstruction = environment.instructions.get(
    declarationInstructionId,
  )!;

  // Use the declaration's binding place directly so that ExportSpecifier
  // holds a read-reference to it, preventing DCE from removing the declaration.
  let localPlace: Place;
  if (declarationInstruction instanceof StoreLocalInstruction) {
    localPlace = declarationInstruction.lval;
  } else if (declarationInstruction instanceof FunctionDeclarationInstruction) {
    localPlace = declarationInstruction.identifier;
  } else {
    throw new Error(
      `Export specifier local '${localName}' references unsupported declaration type`,
    );
  }

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    ExportSpecifierInstruction,
    place,
    nodePath,
    localPlace,
    exportedName,
  );
  functionBuilder.addInstruction(instruction);

  moduleBuilder.exports.set(exportedName, {
    instruction,
    declaration: declarationInstruction,
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
