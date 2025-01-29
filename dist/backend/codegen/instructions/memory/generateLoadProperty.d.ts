import * as t from "@babel/types";
import { LoadPropertyInstruction } from "../../../../ir/instructions/memory/LoadProperty";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateLoadPropertyInstruction(instruction: LoadPropertyInstruction, generator: CodeGenerator): t.MemberExpression;
