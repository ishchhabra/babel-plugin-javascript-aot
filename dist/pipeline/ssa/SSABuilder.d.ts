import { FunctionIR } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
import { Phi } from "./Phi";
export interface SSA {
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
    /**
     * Gathers all the φ-nodes needed for every variable that has multiple definitions
     * in different blocks.
     */
    private computePhiNodes;
    /**
     * For a single declaration, inserts φ-nodes into the dominance frontier of
     * all definition blocks. Uses a standard "workList + dominanceFrontier" approach.
     */
    private insertPhiNodesForDeclaration;
    /**
     * After computing the φ-nodes, populate each φ-node's map from predecessorBlock -> place.
     * This tells the φ-node which place from each predecessor block flows into it.
     */
    private populatePhiOperands;
    /**
     * Rewrites references in all blocks that are dominated by each φ's block.
     * Whenever an instruction refers to one of the φ's operand identifiers,
     * replace it with a LoadPhiInstruction referencing the φ-place.
     */
    private rewritePhiReferences;
    private rewriteInstruction;
}
