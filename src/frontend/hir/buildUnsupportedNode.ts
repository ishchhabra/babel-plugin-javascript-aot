import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { Place, UnsupportedNodeInstruction } from "../../ir";
import { FunctionIRBuilder } from "./FunctionIRBuilder";

export function buildUnsupportedNode(
  nodePath: NodePath<t.Node>,
  functionBuilder: FunctionIRBuilder,
  environment: Environment,
): Place {
  const identifier = environment.createIdentifier();
  const place = environment.createPlace(identifier);
  const instruction = environment.createInstruction(
    UnsupportedNodeInstruction,
    place,
    nodePath,
    nodePath.node,
  );
  functionBuilder.addInstruction(instruction);
  return place;
}
