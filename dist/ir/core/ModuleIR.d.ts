import { Environment } from "../../environment";
import { BaseInstruction } from "../base";
import { ImportDeclarationInstruction } from "../instructions";
import { FunctionIR, FunctionIRId } from "./FunctionIR";
export interface ModuleIR {
    path: string;
    environment: Environment;
    functions: Map<FunctionIRId, FunctionIR>;
    exportToInstructions: Map<string, BaseInstruction>;
    importToInstructions: Map<string, ImportDeclarationInstruction>;
}
