import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { ImportSpecifierInstruction } from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";
import { resolveModulePath } from "./resolveModulePath";

export function buildImportSpecifier(
  specifierNodePath: NodePath<
    t.ImportSpecifier | t.ImportDefaultSpecifier | t.ImportNamespaceSpecifier
  >,
  declarationNodePath: NodePath<t.ImportDeclaration>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const localName = getLocalName(specifierNodePath);
  const importedName = getImportedName(specifierNodePath);

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    ImportSpecifierInstruction,
    place,
    specifierNodePath,
    localName,
    importedName,
  );
  functionBuilder.addInstruction(instruction);

  const source = declarationNodePath.node.source.value;
  moduleBuilder.globals.set(localName, {
    kind: "import",
    name: importedName,
    source: resolveModulePath(source, moduleBuilder.path),
  });

  return place;
}

function getLocalName(
  nodePath: NodePath<
    t.ImportSpecifier | t.ImportDefaultSpecifier | t.ImportNamespaceSpecifier
  >,
) {
  return nodePath.node.local.name;
}

function getImportedName(
  nodePath: NodePath<
    t.ImportSpecifier | t.ImportDefaultSpecifier | t.ImportNamespaceSpecifier
  >,
) {
  const node = nodePath.node;
  if (t.isImportDefaultSpecifier(node)) {
    return "default";
  } else if (t.isImportNamespaceSpecifier(node)) {
    return "*";
  } else {
    const importedNode = node.imported;
    if (t.isIdentifier(importedNode)) {
      return importedNode.name;
    }

    return importedNode.value;
  }
}
