import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../compiler";
import { BasicBlock, BlockId } from "../ir";
export interface HIR {
    blocks: Map<BlockId, BasicBlock>;
}
/**
 * Builds the high-level intermediate representation (HIR) from the AST.
 */
export declare class HIRBuilder {
    #private;
    private readonly program;
    private readonly environment;
    private currentBlock;
    private readonly blocks;
    constructor(program: NodePath<t.Program>, environment: Environment);
    build(): HIR;
}
