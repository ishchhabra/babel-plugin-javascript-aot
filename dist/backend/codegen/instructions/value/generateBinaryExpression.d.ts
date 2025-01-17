import * as t from "@babel/types";
import { BinaryExpressionInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateBinaryExpressionInstruction(instruction: BinaryExpressionInstruction, generator: CodeGenerator): t.Expression;
