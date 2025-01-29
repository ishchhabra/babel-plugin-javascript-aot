import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { createRequire } from "module";
import { Environment } from "../../environment";
import { createInstructionId, ImportSpecifierInstruction } from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";
import { ModuleIRBuilder } from "./ModuleIRBuilder";

export function buildImportSpecifier(
  specifierNodePath: NodePath<t.ImportSpecifier | t.ImportDefaultSpecifier>,
  declarationNodePath: NodePath<t.ImportDeclaration>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
) {
  const localName = getLocalName(specifierNodePath);
  const importedName = getImportedName(specifierNodePath);

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  functionBuilder.addInstruction(
    new ImportSpecifierInstruction(
      createInstructionId(functionBuilder.environment),
      place,
      specifierNodePath,
      localName,
      importedName,
    ),
  );

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
  nodePath: NodePath<t.ImportSpecifier | t.ImportDefaultSpecifier>,
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

function resolveModulePath(importPath: string, path: string): string {
  const require = createRequire(path);
  return require.resolve(importPath);
}
