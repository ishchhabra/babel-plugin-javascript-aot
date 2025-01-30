import * as t from "@babel/types";
import { FunctionExpressionInstruction } from "../../../../ir/instructions/value/FunctionExpression";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateFunctionExpressionInstruction(instruction: FunctionExpressionInstruction, generator: CodeGenerator): t.FunctionExpression;
