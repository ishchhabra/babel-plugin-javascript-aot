import { Environment } from "../../environment";
import { BaseInstruction, ImportDeclarationInstruction } from "../../ir";
import { FunctionIR, FunctionIRId } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
export declare class ModuleIRBuilder {
    readonly path: string;
    readonly environment: Environment;
    readonly exportToInstructions: Map<string, BaseInstruction>;
    readonly importToInstructions: Map<string, ImportDeclarationInstruction>;
    readonly functions: Map<FunctionIRId, FunctionIR>;
    constructor(path: string, environment: Environment);
    build(): ModuleIR;
}
