import * as t from "@babel/types";
import { AssignmentPatternInstruction } from "../../../../ir/instructions/pattern/AssignmentPattern";
import { CodeGenerator } from "../../../CodeGenerator";

export function generateAssignmentPatternInstruction(
  instruction: AssignmentPatternInstruction,
  generator: CodeGenerator,
): t.AssignmentPattern {
  const left = generator.places.get(instruction.left.id);
  if (left === undefined) {
    throw new Error(`Place ${instruction.left.id} not found`);
  }

  const right = generator.places.get(instruction.right.id);
  if (right === undefined) {
    throw new Error(`Place ${instruction.right.id} not found`);
  }

  assertAssignmentPatternLeft(left);
  t.assertExpression(right);

  const node = t.assignmentPattern(left, right);
  generator.places.set(instruction.place.id, node);
  return node;
}

function assertAssignmentPatternLeft(
  node: t.Node | null,
): asserts node is
  | t.Identifier
  | t.ObjectPattern
  | t.ArrayPattern
  | t.MemberExpression
  | t.TSAsExpression
  | t.TSSatisfiesExpression
  | t.TSTypeAssertion
  | t.TSNonNullExpression {}
