import * as t from "@babel/types";
import { ArrayPatternInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateArrayPatternInstruction(instruction: ArrayPatternInstruction, generator: CodeGenerator): t.ArrayPattern;
