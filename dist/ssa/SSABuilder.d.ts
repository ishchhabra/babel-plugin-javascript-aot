import { Environment } from "../compiler";
import { BlockId } from "../ir";
import { Phi } from "./Phi";
interface SSA {
    phis: Set<Phi>;
}
/**
 * Computes the phis for the HIR.
 */
export declare class SSABuilder {
    private readonly predecessors;
    private readonly environment;
    constructor(predecessors: Map<BlockId, Set<BlockId>>, environment: Environment);
    build(): SSA;
}
export {};
