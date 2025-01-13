import * as t from "@babel/types";
import { UnsupportedNodeInstruction } from "../../ir";
import { CodeGenerator } from "../CodeGenerator";

export function generateUnsupportedNode(
  instruction: UnsupportedNodeInstruction,
  generator: CodeGenerator,
): t.Node {
  const node = instruction.node;
  generator.places.set(instruction.place.id, node);
  return node;
}
