import * as t from "@babel/types";
import { ObjectExpressionInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateObjectExpressionInstruction(instruction: ObjectExpressionInstruction, generator: CodeGenerator): t.ObjectExpression;
