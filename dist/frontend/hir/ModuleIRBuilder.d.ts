import { Environment } from "../../environment";
import { FunctionIR, FunctionIRId } from "../../ir/core/FunctionIR";
import { ModuleExport, ModuleGlobal, ModuleIR } from "../../ir/core/ModuleIR";
export declare class ModuleIRBuilder {
    readonly path: string;
    readonly environment: Environment;
    readonly globals: Map<string, ModuleGlobal>;
    readonly exports: Map<string, ModuleExport>;
    readonly functions: Map<FunctionIRId, FunctionIR>;
    constructor(path: string, environment: Environment);
    build(): ModuleIR;
}
