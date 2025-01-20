import * as t from "@babel/types";
import { MemberExpressionInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateMemberExpression(instruction: MemberExpressionInstruction, generator: CodeGenerator): t.Expression;
