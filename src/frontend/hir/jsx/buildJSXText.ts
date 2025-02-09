import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { JSXTextInstruction, Place } from "../../../ir";
import { FunctionIRBuilder } from "../FunctionIRBuilder";

export function buildJSXText(
  nodePath: NodePath<t.JSXText>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
): Place | undefined {
  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    JSXTextInstruction,
    place,
    nodePath,
    nodePath.node.value,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
