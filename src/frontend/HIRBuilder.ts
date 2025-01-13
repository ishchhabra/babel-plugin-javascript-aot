import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../environment";
import {
  BaseInstruction,
  BasicBlock,
  BlockId,
  createBlock,
  Place,
  type DeclarationId,
} from "../ir";
import { buildBindings } from "./hir/bindings/buildBindings";
import { buildNode } from "./hir/buildNode";

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
export class HIRBuilder {
  public readonly exportToInstructions: Map<string, BaseInstruction> =
    new Map();
  public readonly importToPlaces: Map<string, Place> = new Map();

  public currentBlock: BasicBlock;

  public readonly blocks: Map<BlockId, BasicBlock> = new Map();

  constructor(
    public readonly path: string,
    public readonly program: NodePath<t.Program>,
    public readonly environment: Environment,
  ) {
    const entryBlock = createBlock(environment);
    this.blocks.set(entryBlock.id, entryBlock);
    this.currentBlock = entryBlock;
  }

  public build(): HIR {
    buildBindings(this.program, this);

    const bodyPath = this.program.get("body");
    for (const statementPath of bodyPath) {
      buildNode(statementPath, this);
    }

    return {
      blocks: this.blocks,
      exportToInstructions: this.exportToInstructions,
      importToPlaces: this.importToPlaces,
    };
  }

  public registerDeclarationName(
    name: string,
    declarationId: DeclarationId,
    nodePath: NodePath<t.Node>,
  ) {
    nodePath.scope.setData(name, declarationId);
  }

  public getDeclarationId(
    name: string,
    nodePath: NodePath<t.Node>,
  ): DeclarationId | undefined {
    return nodePath.scope.getData(name);
  }

  public registerDeclarationPlace(declarationId: DeclarationId, place: Place) {
    let places = this.environment.declToPlaces.get(declarationId);
    places ??= [];
    places.push({ blockId: this.currentBlock.id, place });
    this.environment.declToPlaces.set(declarationId, places);
  }

  public getLatestDeclarationPlace(
    declarationId: DeclarationId,
  ): Place | undefined {
    const places = this.environment.declToPlaces.get(declarationId);
    return places?.at(-1)?.place;
  }
}
