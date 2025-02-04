import * as t from "@babel/types";
import { RestElementInstruction } from "../../../ir";
import { CodeGenerator } from "../../CodeGenerator";
export declare function generateRestElementInstruction(instruction: RestElementInstruction, generator: CodeGenerator): t.RestElement;
