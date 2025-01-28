import * as t from "@babel/types";
import { ArrowFunctionExpressionInstruction } from "../../../../ir/instructions/value/ArrowFunctionExpression";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateArrowFunctionExpressionInstruction(instruction: ArrowFunctionExpressionInstruction, generator: CodeGenerator): t.ArrowFunctionExpression;
