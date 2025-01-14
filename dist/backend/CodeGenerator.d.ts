import * as t from "@babel/types";
import { ProjectUnit } from "../frontend/ProjectBuilder";
import { BasicBlock, BlockId, PlaceId } from "../ir";
/**
 * Generates the code from the IR.
 */
export declare class CodeGenerator {
    readonly projectUnit: ProjectUnit;
    readonly path: string;
    readonly places: Map<PlaceId, t.Node | null>;
    readonly blockToStatements: Map<BlockId, Array<t.Statement>>;
    readonly generatedBlocks: Set<BlockId>;
    readonly blocks: Map<BlockId, BasicBlock>;
    readonly backEdges: Map<BlockId, Set<BlockId>>;
    constructor(projectUnit: ProjectUnit, path: string);
    generate(): string;
}
