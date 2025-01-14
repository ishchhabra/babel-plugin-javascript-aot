import { ModuleUnit } from "../../frontend/ModuleBuilder";
import { Phi } from "./Phi";
interface SSA {
    phis: Set<Phi>;
}
/**
 * Computes the phis for the HIR.
 */
export declare class SSABuilder {
    private readonly moduleUnit;
    constructor(moduleUnit: ModuleUnit);
    build(): SSA;
}
export {};
