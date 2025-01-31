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
 * @param environment - The environment managing IR state
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
    const latestDeclaration = environment.getLatestDeclaration(declarationId);
    place = environment.places.get(latestDeclaration.placeId);
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

  const identifier = environment.createIdentifier(declarationId);
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

    const latestDeclaration = environment.getLatestDeclaration(declarationId);
    const declarationPlace = environment.places.get(latestDeclaration.placeId);
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
