import { Environment } from "../../environment";
import { BlockId } from "../../frontend/ir";
import { Phi } from "./Phi";
interface SSA {
    phis: Set<Phi>;
}
/**
 * Computes the phis for the HIR.
 */
export declare class SSABuilder {
    private readonly predecessors;
    private readonly dominanceFrontier;
    private readonly environment;
    constructor(predecessors: Map<BlockId, Set<BlockId>>, dominanceFrontier: Map<BlockId, Set<BlockId>>, environment: Environment);
    build(): SSA;
}
export {};
