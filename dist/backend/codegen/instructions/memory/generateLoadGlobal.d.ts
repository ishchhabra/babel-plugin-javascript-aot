import * as t from "@babel/types";
import { LoadGlobalInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateLoadGlobalInstruction(instruction: LoadGlobalInstruction, generator: CodeGenerator): t.Expression;
