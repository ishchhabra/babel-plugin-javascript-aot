import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { JSXFragmentInstruction, Place } from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
import { buildNode } from "../buildNode";

export function buildJSXFragment(
  nodePath: NodePath<t.JSXFragment>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place | undefined {
  const openingFragmentPath = nodePath.get("openingFragment");
  const openingFragmentPlace = buildNode(
    openingFragmentPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (
    openingFragmentPlace === undefined ||
    Array.isArray(openingFragmentPlace)
  ) {
    throw new Error("JSXFragment: openingFragment should be a single place");
  }

  const closingFragmentPath = nodePath.get("closingFragment");
  const closingFragmentPlace = buildNode(
    closingFragmentPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (
    closingFragmentPlace === undefined ||
    Array.isArray(closingFragmentPlace)
  ) {
    throw new Error("JSXFragment: closingFragment should be a single place");
  }

  const children = nodePath.get("children");
  const childrenPlaces = children.map((child) => {
    const place = buildNode(child, functionBuilder, moduleBuilder, environment);
    if (place === undefined || Array.isArray(place)) {
      throw new Error("JSXFragment: child should be a single place");
    }
    return place;
  });

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    JSXFragmentInstruction,
    place,
    nodePath,
    openingFragmentPlace,
    closingFragmentPlace,
    childrenPlaces,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
