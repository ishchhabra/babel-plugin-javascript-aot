import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { JSXElementInstruction, Place } from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";
import { ModuleIRBuilder } from "../ModuleIRBuilder";
import { buildNode } from "../buildNode";

export function buildJSXElement(
  nodePath: NodePath<t.JSXElement>,
  functionBuilder: FunctionIRBuilder,
  moduleBuilder: ModuleIRBuilder,
  environment: Environment,
): Place | undefined {
  const openingElementPath = nodePath.get("openingElement");
  const openingElement = buildNode(
    openingElementPath,
    functionBuilder,
    moduleBuilder,
    environment,
  );
  if (openingElement === undefined || Array.isArray(openingElement)) {
    throw new Error("JSXElement opening element should be a single place");
  }

  let closingElement;
  const closingElementPath = nodePath.get("closingElement");
  if (closingElementPath.hasNode()) {
    closingElement = buildNode(
      closingElementPath,
      functionBuilder,
      moduleBuilder,
      environment,
    );
  }
  if (Array.isArray(closingElement)) {
    throw new Error("JSXElement closing element should be a single place");
  }

  const children = nodePath.get("children");
  const childrenPlaces = children.map((child) => {
    const place = buildNode(child, functionBuilder, moduleBuilder, environment);
    if (place === undefined || Array.isArray(place)) {
      throw new Error("JSXElement child should be a single place");
    }
    return place;
  });

  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    JSXElementInstruction,
    place,
    nodePath,
    openingElement,
    closingElement,
    childrenPlaces,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
