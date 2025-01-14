import * as t from "@babel/types";
import { BaseInstruction } from "../../../ir";
import { CodeGenerator } from "../../CodeGenerator";
export declare function generateInstruction(instruction: BaseInstruction, generator: CodeGenerator): Array<t.Statement>;
