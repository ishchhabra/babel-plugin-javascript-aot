import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import {
  BasicBlock,
  BlockId,
  createBlock,
  DeclarationId,
  Place,
} from "../../ir";
import { FunctionIR, makeFunctionIRId } from "../../ir/core/FunctionIR";
import { buildBindings } from "./bindings";
import { buildNode } from "./buildNode";
import { ModuleIRBuilder } from "./ModuleIRBuilder";

export class FunctionIRBuilder {
  public currentBlock: BasicBlock;
  public readonly blocks: Map<BlockId, BasicBlock> = new Map();

  constructor(
    public readonly nodePath: NodePath<t.Program | t.BlockStatement>,
    public readonly environment: Environment,
    public readonly moduleBuilder: ModuleIRBuilder,
    public readonly params: Place[],
  ) {
    const entryBlock = createBlock(environment);
    this.blocks.set(entryBlock.id, entryBlock);
    this.currentBlock = entryBlock;
  }

  public build(): FunctionIR {
    const functionId = makeFunctionIRId(this.environment.nextFunctionId++);
    buildBindings(this.nodePath, this);

    const bodyPath = this.nodePath.get("body");
    for (const statementPath of bodyPath) {
      buildNode(statementPath, this, this.moduleBuilder);
    }

    const functionIR = new FunctionIR(functionId, this.params, this.blocks);
    this.moduleBuilder.functions.set(functionIR.id, functionIR);
    return functionIR;
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
    const places = this.environment.declToPlaces.get(declarationId) ?? [];
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
