import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../environment";
import { BasicBlock, BlockId, Place } from "./ir";
/**
 * Represents the High-Level Intermediate Representation (HIR) of a program.
 */
export interface HIR {
    blocks: Map<BlockId, BasicBlock>;
    exportToPlaces: Map<string, Place>;
    importToPlaces: Map<string, Place>;
}
/**
 * Builds the High-Level Intermediate Representation (HIR) from the AST.
 */
export declare class HIRBuilder {
    #private;
    private readonly program;
    private readonly environment;
    private readonly exportToPlaces;
    private readonly importToPlaces;
    private currentBlock;
    private readonly blocks;
    constructor(program: NodePath<t.Program>, environment: Environment);
    build(): HIR;
}
