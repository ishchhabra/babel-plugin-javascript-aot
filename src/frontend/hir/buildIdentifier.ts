import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import {
  BindingIdentifierInstruction,
  createIdentifier,
  createPlace,
  LoadGlobalInstruction,
  LoadLocalInstruction,
  makeInstructionId,
  Place,
} from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";

/**
 * Builds a place for an identifier. If the identifier is not a variable declarator,
 * a load instruction is created to load the identifier from the scope.
 */
export function buildIdentifier(
  nodePath: NodePath<t.Identifier>,
  builder: FunctionIRBuilder,
) {
  if (nodePath.isReferencedIdentifier()) {
    return buildReferencedIdentifier(nodePath, builder);
  } else {
    return buildBindingIdentifier(nodePath, builder);
  }
}

function buildBindingIdentifier(
  nodePath: NodePath<t.Identifier>,
  builder: FunctionIRBuilder,
) {
  const name = nodePath.node.name;

  let place: Place | undefined;
  // In case we already have a declaration place, we need to use that, so that
  // we're using the place that was created when the binding was discovered
  // in #buildBindings.
  const declarationId = builder.getDeclarationId(name, nodePath);
  if (declarationId !== undefined) {
    place = builder.getLatestDeclarationPlace(declarationId);
  }

  if (place === undefined) {
    const identifier = createIdentifier(builder.environment);
    place = createPlace(identifier, builder.environment);
  }

  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );

  builder.addInstruction(
    new BindingIdentifierInstruction(instructionId, place, nodePath, name),
  );

  return place;
}

function buildReferencedIdentifier(
  nodePath: NodePath<t.Identifier>,
  builder: FunctionIRBuilder,
) {
  const name = nodePath.node.name;
  const declarationId = builder.getDeclarationId(name, nodePath);

  const identifier = createIdentifier(builder.environment);
  const place = createPlace(identifier, builder.environment);
  const instructionId = makeInstructionId(
    builder.environment.nextInstructionId++,
  );

  if (declarationId === undefined) {
    const binding = nodePath.scope.getBinding(name);
    builder.addInstruction(
      new LoadGlobalInstruction(
        instructionId,
        place,
        nodePath,
        name,
        binding?.kind === "module" ? "import" : "builtin",
        binding?.kind === "module"
          ? (binding.path.parent as t.ImportDeclaration).source.value
          : undefined,
      ),
    );
  } else {
    const declarationId = builder.getDeclarationId(name, nodePath);
    if (declarationId === undefined) {
      throw new Error(`Variable accessed before declaration: ${name}`);
    }

    const declarationPlace = builder.getLatestDeclarationPlace(declarationId);
    if (declarationPlace === undefined) {
      throw new Error(
        `Unable to find the place for ${name} (${declarationId})`,
      );
    }

    builder.addInstruction(
      new LoadLocalInstruction(
        instructionId,
        place,
        nodePath,
        declarationPlace,
      ),
    );
  }

  return place;
}
