import { Environment } from "../environment";
import { HIR } from "./HIRBuilder";
export interface ModuleUnit {
    path: string;
    environment: Environment;
    hir: HIR;
}
export declare class ModuleBuilder {
    private readonly path;
    readonly environment: Environment;
    constructor(path: string, environment: Environment);
    build(): ModuleUnit;
}
