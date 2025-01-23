import * as t from "@babel/types";
import { LoadLocalInstruction } from "../../../../ir";
import { CodeGenerator } from "../../../CodeGenerator";
export declare function generateLoadLocalInstruction(instruction: LoadLocalInstruction, generator: CodeGenerator): t.Expression;
