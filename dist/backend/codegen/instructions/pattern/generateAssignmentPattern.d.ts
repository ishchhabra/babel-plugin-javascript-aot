import * as t from "@babel/types";
import { AssignmentPatternInstruction } from "../../../../ir/instructions/pattern/AssignmentPattern";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateAssignmentPatternInstruction(instruction: AssignmentPatternInstruction, generator: CodeGenerator): t.AssignmentPattern;
