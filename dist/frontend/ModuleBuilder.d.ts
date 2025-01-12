import { Environment } from "../environment";
import { BaseInstruction, BasicBlock, BlockId, Place } from "./ir";
export interface ModuleUnit {
    path: string;
    environment: Environment;
    blocks: Map<BlockId, BasicBlock>;
    exportToInstructions: Map<string, BaseInstruction>;
    importToPlaces: Map<string, Place>;
    predecessors: Map<BlockId, Set<BlockId>>;
    dominators: Map<BlockId, Set<BlockId>>;
    dominanceFrontier: Map<BlockId, Set<BlockId>>;
    backEdges: Map<BlockId, Set<BlockId>>;
}
export declare class ModuleBuilder {
    private readonly path;
    readonly environment: Environment;
    constructor(path: string, environment: Environment);
    build(): ModuleUnit;
}
