import * as t from "@babel/types";
import { LogicalExpressionInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateLogicalExpressionInstruction(instruction: LogicalExpressionInstruction, generator: CodeGenerator): t.Expression;
