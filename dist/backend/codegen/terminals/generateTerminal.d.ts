import * as t from "@babel/types";
import { BaseTerminal } from "../../../ir";
import { CodeGenerator } from "../../CodeGenerator";
export declare function generateTerminal(terminal: BaseTerminal, generator: CodeGenerator): Array<t.Statement>;
