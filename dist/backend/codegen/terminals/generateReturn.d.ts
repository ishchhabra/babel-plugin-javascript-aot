import * as t from "@babel/types";
import { ReturnTerminal } from "../../../ir";
import { CodeGenerator } from "../../CodeGenerator";
export declare function generateReturnTerminal(terminal: ReturnTerminal, generator: CodeGenerator): Array<t.Statement>;
