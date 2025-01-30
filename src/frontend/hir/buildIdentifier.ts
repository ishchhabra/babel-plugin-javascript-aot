import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import {
  BindingIdentifierInstruction,
  LoadGlobalInstruction,
  LoadLocalInstruction,
  Place,
} from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";

/**
 * Builds a place for an identifier. If the identifier is not a variable declarator,
 * a load instruction is created to load the identifier from the scope. Otherwise,
 * a binding instruction is created.
 *
 * @param nodePath - The Babel NodePath for the identifier
 * @param builder - The FunctionIRBuilder managing IR state
 * @param options.declInstrPlace - If provided, the place is recoded in the
 * environment's `declToDeclInstrPlace` mapping as the "declaration instruction
 * place" for this identifier's `DeclarationId`. In other words, if `declInstrPlace`
 * is set, the newly created or updated declaration place for this identifier is
 * associated with the provided instruction place in the IR, allowing
 * multi-declaration statements (e.g. `const a=1,b=2`) or subsequent exports
 * to reference this higher-level statement/instruction.
 *
 * @returns The `Place` representing this identifier in the IR
 */
export function buildIdentifier(
  nodePath: NodePath<t.Identifier>,
  builder: FunctionIRBuilder,
  environment: Environment,
) {
  if (nodePath.isReferencedIdentifier()) {
    return buildReferencedIdentifier(nodePath, builder, environment);
  } else {
    return buildBindingIdentifier(nodePath, builder, environment);
  }
}

export function buildBindingIdentifier(
  nodePath: NodePath<t.Identifier>,
  builder: FunctionIRBuilder,
  environment: Environment,
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
    const identifier = environment.createIdentifier();
    place = environment.createPlace(identifier);
  }

  const instruction = environment.createInstruction(
    BindingIdentifierInstruction,
    place,
    nodePath,
    name,
  );
  builder.addInstruction(instruction);

  return place;
}

function buildReferencedIdentifier(
  nodePath: NodePath<t.Identifier>,
  builder: FunctionIRBuilder,
  environment: Environment,
) {
  const name = nodePath.node.name;
  const declarationId = builder.getDeclarationId(name, nodePath);

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);

  if (declarationId === undefined) {
    const instruction = environment.createInstruction(
      LoadGlobalInstruction,
      place,
      nodePath,
      name,
    );
    builder.addInstruction(instruction);
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

    const instruction = environment.createInstruction(
      LoadLocalInstruction,
      place,
      nodePath,
      declarationPlace,
    );
    builder.addInstruction(instruction);
  }

  return place;
}
