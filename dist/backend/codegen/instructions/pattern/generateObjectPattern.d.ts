import * as t from "@babel/types";
import { ObjectPatternInstruction } from "../../../../ir/instructions/pattern/ObjectPattern";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateObjectPatternInstruction(instruction: ObjectPatternInstruction, generator: CodeGenerator): t.ObjectPattern;
