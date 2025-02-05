import * as t from "@babel/types";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { CodeGenerator } from "../CodeGenerator";
export declare function generateFunction(functionIR: FunctionIR, generator: CodeGenerator): {
    params: Array<t.Identifier | t.RestElement | t.Pattern>;
    statements: Array<t.Statement>;
};
