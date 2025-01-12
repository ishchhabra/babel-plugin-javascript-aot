import { BasicBlock, BlockId } from "../../frontend/ir";
import { ModuleUnit } from "../../frontend/ModuleBuilder";
import { Phi } from "./Phi";
interface SSAEliminationResult {
    blocks: Map<BlockId, BasicBlock>;
}
/**
 * Eliminates the phis from the HIR by inserting copy instructions.
 */
export declare class SSAEliminator {
    #private;
    private readonly moduleUnit;
    private readonly phis;
    constructor(moduleUnit: ModuleUnit, phis: Set<Phi>);
    eliminate(): SSAEliminationResult;
}
export {};
