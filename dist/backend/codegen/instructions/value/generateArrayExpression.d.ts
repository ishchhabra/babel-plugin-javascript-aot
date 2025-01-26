import * as t from "@babel/types";
import { ArrayExpressionInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateArrayExpressionInstruction(instruction: ArrayExpressionInstruction, generator: CodeGenerator): t.Expression;
