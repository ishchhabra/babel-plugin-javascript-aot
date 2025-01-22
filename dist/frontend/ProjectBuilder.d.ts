import { ModuleIR } from "../ir/core/ModuleIR";
export interface ProjectUnit {
    modules: Map<string, ModuleIR>;
    postOrder: string[];
}
export declare class ProjectBuilder {
    private readonly modules;
    constructor();
    build(entryPoint: string): ProjectUnit;
    private buildModule;
    private getPostOrder;
}
