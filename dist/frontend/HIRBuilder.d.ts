import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../environment";
import { BaseInstruction, BasicBlock, BlockId, Place, type DeclarationId } from "../ir";
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
    readonly path: string;
    readonly program: NodePath<t.Program>;
    readonly environment: Environment;
    readonly exportToInstructions: Map<string, BaseInstruction>;
    readonly importToPlaces: Map<string, Place>;
    currentBlock: BasicBlock;
    readonly blocks: Map<BlockId, BasicBlock>;
    constructor(path: string, program: NodePath<t.Program>, environment: Environment);
    build(): HIR;
    registerDeclarationName(name: string, declarationId: DeclarationId, nodePath: NodePath<t.Node>): void;
    getDeclarationId(name: string, nodePath: NodePath<t.Node>): DeclarationId | undefined;
    registerDeclarationPlace(declarationId: DeclarationId, place: Place): void;
    getLatestDeclarationPlace(declarationId: DeclarationId): Place | undefined;
}
