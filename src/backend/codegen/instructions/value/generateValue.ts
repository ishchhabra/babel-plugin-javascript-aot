import * as t from "@babel/types";
import {
  ArrayExpressionInstruction,
  BinaryExpressionInstruction,
  CallExpressionInstruction,
  HoleInstruction,
  LiteralInstruction,
  LogicalExpressionInstruction,
  NewExpressionInstruction,
  ObjectExpressionInstruction,
  ObjectMethodInstruction,
  ObjectPropertyInstruction,
  SequenceExpressionInstruction,
  TemplateLiteralInstruction,
  UnaryExpressionInstruction,
  ValueInstruction,
} from "../../../../ir";
import { FunctionIR } from "../../../../ir/core/FunctionIR";
import { RegExpLiteralInstruction } from "../../../../ir/instructions/value/RegExpLiteral";
import { ArrowFunctionExpressionInstruction } from "../../../../ir/instructions/value/ArrowFunctionExpression";
import { AwaitExpressionInstruction } from "../../../../ir/instructions/value/AwaitExpression";
import { FunctionExpressionInstruction } from "../../../../ir/instructions/value/FunctionExpression";
import { TaggedTemplateExpressionInstruction } from "../../../../ir/instructions/value/TaggedTemplateExpression";
import { ThisExpressionInstruction } from "../../../../ir/instructions/value/ThisExpression";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateArrayExpressionInstruction } from "./generateArrayExpression";
import { generateAwaitExpressionInstruction } from "./generateAwaitExpression";
import { generateArrowFunctionExpressionInstruction } from "./generateArrowFunctionExpression";
import { generateBinaryExpressionInstruction } from "./generateBinaryExpression";
import { generateCallExpression } from "./generateCallExpression";
import { generateFunctionExpressionInstruction } from "./generateFunctionExpression";
import { generateHoleInstruction } from "./generateHole";
import { generateLiteralInstruction } from "./generateLiteral";
import { generateLogicalExpressionInstruction } from "./generateLogicalExpression";
import { generateNewExpressionInstruction } from "./generateNewExpression";
import { generateObjectExpressionInstruction } from "./generateObjectExpression";
import { generateObjectMethodInstruction } from "./generateObjectMethod";
import { generateObjectPropertyInstruction } from "./generateObjectProperty";
import { generateRegExpLiteralInstruction } from "./generateRegExpLiteral";
import { generateSequenceExpressionInstruction } from "./generateSequenceExpression";
import { generateTemplateLiteralInstruction } from "./generateTemplateLiteral";
import { generateThisExpressionInstruction } from "./generateThisExpression";
import { generateTaggedTemplateExpressionInstruction } from "./generateTaggedTemplateExpression";
import { generateUnaryExpressionInstruction } from "./generateUnaryExpression";
import { YieldExpressionInstruction } from "../../../../ir/instructions/value/YieldExpression";
import { generateYieldExpressionInstruction } from "./generateYieldExpression";

export function generateValueInstruction(
  instruction: ValueInstruction,
  functionIR: FunctionIR,
  generator: CodeGenerator,
): t.Expression | t.ObjectMethod | t.ObjectProperty | null {
  if (instruction instanceof ArrayExpressionInstruction) {
    return generateArrayExpressionInstruction(instruction, generator);
  } else if (instruction instanceof AwaitExpressionInstruction) {
    return generateAwaitExpressionInstruction(instruction, generator);
  } else if (instruction instanceof ArrowFunctionExpressionInstruction) {
    return generateArrowFunctionExpressionInstruction(instruction, generator);
  } else if (instruction instanceof BinaryExpressionInstruction) {
    return generateBinaryExpressionInstruction(instruction, generator);
  } else if (instruction instanceof CallExpressionInstruction) {
    return generateCallExpression(instruction, generator);
  } else if (instruction instanceof FunctionExpressionInstruction) {
    return generateFunctionExpressionInstruction(instruction, generator);
  } else if (instruction instanceof HoleInstruction) {
    return generateHoleInstruction(instruction, generator);
  } else if (instruction instanceof LiteralInstruction) {
    return generateLiteralInstruction(instruction, generator);
  } else if (instruction instanceof LogicalExpressionInstruction) {
    return generateLogicalExpressionInstruction(instruction, generator);
  } else if (instruction instanceof NewExpressionInstruction) {
    return generateNewExpressionInstruction(instruction, generator);
  } else if (instruction instanceof RegExpLiteralInstruction) {
    return generateRegExpLiteralInstruction(instruction, generator);
  } else if (instruction instanceof ObjectExpressionInstruction) {
    return generateObjectExpressionInstruction(instruction, generator);
  } else if (instruction instanceof ObjectMethodInstruction) {
    return generateObjectMethodInstruction(instruction, generator);
  } else if (instruction instanceof ObjectPropertyInstruction) {
    return generateObjectPropertyInstruction(instruction, generator);
  } else if (instruction instanceof SequenceExpressionInstruction) {
    return generateSequenceExpressionInstruction(instruction, generator);
  } else if (instruction instanceof TemplateLiteralInstruction) {
    return generateTemplateLiteralInstruction(instruction, generator);
  } else if (instruction instanceof ThisExpressionInstruction) {
    return generateThisExpressionInstruction(instruction, generator);
  } else if (instruction instanceof TaggedTemplateExpressionInstruction) {
    return generateTaggedTemplateExpressionInstruction(instruction, generator);
  } else if (instruction instanceof UnaryExpressionInstruction) {
    return generateUnaryExpressionInstruction(instruction, generator);
  } else if (instruction instanceof YieldExpressionInstruction) {
    return generateYieldExpressionInstruction(instruction, generator);
  }

  throw new Error(`Unsupported value type: ${instruction.constructor.name}`);
}
