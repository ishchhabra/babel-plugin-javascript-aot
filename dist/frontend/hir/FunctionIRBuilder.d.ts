import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { BaseInstruction, BasicBlock, BlockId, DeclarationId, Place } from "../../ir";
import { FunctionIR } from "../../ir/core/FunctionIR";
import { ModuleIRBuilder } from "./ModuleIRBuilder";
export declare class FunctionIRBuilder {
    readonly paramPaths: NodePath<t.Identifier | t.RestElement | t.Pattern>[];
    readonly bodyPath: NodePath<t.Program | t.BlockStatement>;
    readonly environment: Environment;
    readonly moduleBuilder: ModuleIRBuilder;
    currentBlock: BasicBlock;
    readonly blocks: Map<BlockId, BasicBlock>;
    readonly header: BaseInstruction[];
    constructor(paramPaths: NodePath<t.Identifier | t.RestElement | t.Pattern>[], bodyPath: NodePath<t.Program | t.BlockStatement>, environment: Environment, moduleBuilder: ModuleIRBuilder);
    build(): FunctionIR;
    addInstruction<T extends BaseInstruction>(instruction: T): void;
    registerDeclarationName(name: string, declarationId: DeclarationId, nodePath: NodePath<t.Node>): void;
    getDeclarationId(name: string, nodePath: NodePath<t.Node>): DeclarationId | undefined;
    registerDeclarationPlace(declarationId: DeclarationId, place: Place): void;
    getLatestDeclarationPlace(declarationId: DeclarationId): Place | undefined;
    getDeclarationInstruction(declarationId: DeclarationId): BaseInstruction | undefined;
}
