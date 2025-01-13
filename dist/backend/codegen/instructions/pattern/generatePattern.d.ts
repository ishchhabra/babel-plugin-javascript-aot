import * as t from "@babel/types";
import { PatternInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generatePatternInstruction(instruction: PatternInstruction, generator: CodeGenerator): t.Pattern | t.SpreadElement;
