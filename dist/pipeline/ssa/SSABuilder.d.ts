import { FunctionIR } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
import { Phi } from "./Phi";
interface SSA {
    phis: Set<Phi>;
}
/**
 * Computes the phis for the HIR.
 */
export declare class SSABuilder {
    private readonly functionIR;
    private readonly moduleIR;
    constructor(functionIR: FunctionIR, moduleIR: ModuleIR);
    build(): SSA;
}
export {};
