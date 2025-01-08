import { ModuleUnit } from "./ModuleBuilder";
export declare class ProjectBuilder {
    private readonly modules;
    constructor();
    build(entryPoint: string): ModuleUnit;
    private buildModule;
}
