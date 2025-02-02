import * as t from "@babel/types";
import { LoadStaticPropertyInstruction } from "../../../../ir/instructions/memory/LoadStaticProperty";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateLoadStaticPropertyInstruction(instruction: LoadStaticPropertyInstruction, generator: CodeGenerator): t.MemberExpression;
