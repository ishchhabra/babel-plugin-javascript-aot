import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../environment";
import { BasicBlock, BlockId, Place } from "./ir";
import { BaseInstruction } from "./ir/Instruction";
/**
 * Represents the High-Level Intermediate Representation (HIR) of a program.
 */
export interface HIR {
    blocks: Map<BlockId, BasicBlock>;
    exportToInstructions: Map<string, BaseInstruction>;
    importToPlaces: Map<string, Place>;
}
/**
 * Builds the High-Level Intermediate Representation (HIR) from the AST.
 */
export declare class HIRBuilder {
    #private;
    private readonly path;
    private readonly program;
    private readonly environment;
    private readonly exportToInstructions;
    private readonly importToPlaces;
    private currentBlock;
    private readonly blocks;
    constructor(path: string, program: NodePath<t.Program>, environment: Environment);
    build(): HIR;
}
