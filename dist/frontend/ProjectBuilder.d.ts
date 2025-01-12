import { ModuleUnit } from "./ModuleBuilder";
export interface ProjectUnit {
    modules: Map<string, ModuleUnit>;
    postOrder: string[];
}
export declare class ProjectBuilder {
    private readonly modules;
    constructor();
    build(entryPoint: string): ProjectUnit;
    private buildModule;
    private getPostOrder;
}
