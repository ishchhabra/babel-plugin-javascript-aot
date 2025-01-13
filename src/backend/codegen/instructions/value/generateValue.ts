import * as t from "@babel/types";
import {
  ArrayExpressionInstruction,
  BinaryExpressionInstruction,
  CallExpressionInstruction,
  HoleInstruction,
  LiteralInstruction,
  LogicalExpressionInstruction,
  MemberExpressionInstruction,
  ObjectExpressionInstruction,
  ObjectMethodInstruction,
  ObjectPropertyInstruction,
  UnaryExpressionInstruction,
  ValueInstruction,
} from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateArrayExpressionInstruction } from "./generateArrayExpression";
import { generateBinaryExpressionInstruction } from "./generateBinaryExpression";
import { generateCallExpression } from "./generateCallExpression";
import { generateHoleInstruction } from "./generateHole";
import { generateLiteralInstruction } from "./generateLiteral";
import { generateLogicalExpressionInstruction } from "./generateLogicalExpression";
import { generateMemberExpression } from "./generateMemberExpression";
import { generateObjectExpressionInstruction } from "./generateObjectExpression";
import { generateObjectMethodInstruction } from "./generateObjectMethod";
import { generateObjectPropertyInstruction } from "./generateObjectProperty";
import { generateUnaryExpressionInstruction } from "./generateUnaryExpression";

export function generateValueInstruction(
  instruction: ValueInstruction,
  generator: CodeGenerator,
): t.Expression | t.ObjectMethod | t.ObjectProperty | null {
  if (instruction instanceof ArrayExpressionInstruction) {
    return generateArrayExpressionInstruction(instruction, generator);
  } else if (instruction instanceof BinaryExpressionInstruction) {
    return generateBinaryExpressionInstruction(instruction, generator);
  } else if (instruction instanceof CallExpressionInstruction) {
    return generateCallExpression(instruction, generator);
  } else if (instruction instanceof HoleInstruction) {
    return generateHoleInstruction(instruction, generator);
  } else if (instruction instanceof LiteralInstruction) {
    return generateLiteralInstruction(instruction, generator);
  } else if (instruction instanceof LogicalExpressionInstruction) {
    return generateLogicalExpressionInstruction(instruction, generator);
  } else if (instruction instanceof MemberExpressionInstruction) {
    return generateMemberExpression(instruction, generator);
  } else if (instruction instanceof ObjectExpressionInstruction) {
    return generateObjectExpressionInstruction(instruction, generator);
  } else if (instruction instanceof ObjectMethodInstruction) {
    return generateObjectMethodInstruction(instruction, generator);
  } else if (instruction instanceof ObjectPropertyInstruction) {
    return generateObjectPropertyInstruction(instruction, generator);
  } else if (instruction instanceof UnaryExpressionInstruction) {
    return generateUnaryExpressionInstruction(instruction, generator);
  }

  throw new Error(`Unsupported value type: ${instruction.constructor.name}`);
}
