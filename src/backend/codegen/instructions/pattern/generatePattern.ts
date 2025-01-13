import * as t from "@babel/types";
import {
  ArrayPatternInstruction,
  PatternInstruction,
  SpreadElementInstruction,
} from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
import { generateArrayPatternInstruction } from "./generateArrayPattern";
import { generateSpreadElementInstruction } from "./generateSpreadElement";

export function generatePatternInstruction(
  instruction: PatternInstruction,
  generator: CodeGenerator,
): t.Pattern | t.SpreadElement {
  if (instruction instanceof ArrayPatternInstruction) {
    return generateArrayPatternInstruction(instruction, generator);
  } else if (instruction instanceof SpreadElementInstruction) {
    return generateSpreadElementInstruction(instruction, generator);
  }

  throw new Error(`Unsupported pattern type: ${instruction.constructor.name}`);
}
