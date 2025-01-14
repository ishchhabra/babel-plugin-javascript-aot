import * as t from "@babel/types";
import { BranchTerminal } from "../../../ir";
import { CodeGenerator } from "../../CodeGenerator";
export declare function generateBranchTerminal(terminal: BranchTerminal, generator: CodeGenerator): Array<t.Statement>;
