import { BasicBlock, BlockId } from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
import { Phi } from "./Phi";
interface SSAEliminationResult {
    blocks: Map<BlockId, BasicBlock>;
}
/**
 * Eliminates the phis from the HIR by inserting copy instructions.
 */
export declare class SSAEliminator {
    #private;
    private readonly functionIR;
    private readonly moduleIR;
    private readonly phis;
    constructor(functionIR: FunctionIR, moduleIR: ModuleIR, phis: Set<Phi>);
    eliminate(): SSAEliminationResult;
}
export {};
