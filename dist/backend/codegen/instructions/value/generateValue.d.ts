import * as t from "@babel/types";
import { ValueInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateValueInstruction(instruction: ValueInstruction, generator: CodeGenerator): t.Expression | t.ObjectMethod | t.ObjectProperty | null;
