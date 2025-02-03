import * as t from "@babel/types";
import { CallExpressionInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateCallExpression(instruction: CallExpressionInstruction, generator: CodeGenerator): t.Expression;
