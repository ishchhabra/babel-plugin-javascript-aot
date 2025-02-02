import * as t from "@babel/types";
import { LoadDynamicPropertyInstruction } from "../../../../ir/instructions/memory/LoadDynamicProperty";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateLoadDynamicPropertyInstruction(instruction: LoadDynamicPropertyInstruction, generator: CodeGenerator): t.MemberExpression;
