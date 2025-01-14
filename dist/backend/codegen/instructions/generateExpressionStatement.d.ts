import * as t from "@babel/types";
import { ExpressionStatementInstruction } from "../../../ir";
import { CodeGenerator } from "../../CodeGenerator";
export declare function generateExpressionStatementInstruction(instruction: ExpressionStatementInstruction, generator: CodeGenerator): t.Statement | undefined;
