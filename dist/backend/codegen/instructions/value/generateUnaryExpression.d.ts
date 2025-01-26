import * as t from "@babel/types";
import { UnaryExpressionInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateUnaryExpressionInstruction(instruction: UnaryExpressionInstruction, generator: CodeGenerator): t.UnaryExpression;
