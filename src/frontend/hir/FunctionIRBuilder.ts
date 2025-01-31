import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { BaseInstruction, BasicBlock, BlockId, DeclarationId } from "../../ir";
import { FunctionIR, makeFunctionIRId } from "../../ir/core/FunctionIR";
import { buildBindings } from "./bindings";
import { buildFunctionParams } from "./buildFunctionParams";
import { buildNode } from "./buildNode";
import { ModuleIRBuilder } from "./ModuleIRBuilder";

export class FunctionIRBuilder {
  public currentBlock: BasicBlock;
  public readonly blocks: Map<BlockId, BasicBlock> = new Map();
  public readonly header: BaseInstruction[] = [];

  constructor(
    public readonly paramPaths: NodePath<
      t.Identifier | t.RestElement | t.Pattern
    >[],
    public readonly bodyPath: NodePath<
      t.Program | t.BlockStatement | t.Expression
    >,
    public readonly environment: Environment,
    public readonly moduleBuilder: ModuleIRBuilder,
  ) {
    const entryBlock = this.environment.createBlock();
    this.blocks.set(entryBlock.id, entryBlock);
    this.currentBlock = entryBlock;
  }

  public build(): FunctionIR {
    const params = buildFunctionParams(
      this.paramPaths,
      this.bodyPath,
      this,
      this.environment,
    );

    const functionId = makeFunctionIRId(this.environment.nextFunctionId++);

    if (this.bodyPath.isExpression()) {
      buildNode(this.bodyPath, this, this.moduleBuilder, this.environment);
    } else {
      buildBindings(this.bodyPath, this, this.environment);
      const bodyPath = this.bodyPath.get("body");
      if (!Array.isArray(bodyPath)) {
        throw new Error("Body path is not an array");
      }

      for (const statementPath of bodyPath) {
        buildNode(statementPath, this, this.moduleBuilder, this.environment);
      }
    }

    const functionIR = new FunctionIR(
      functionId,
      this.header,
      params,
      this.blocks,
    );
    this.moduleBuilder.functions.set(functionIR.id, functionIR);
    return functionIR;
  }

  public addInstruction<T extends BaseInstruction>(instruction: T) {
    this.currentBlock.instructions.push(instruction);
    this.environment.placeToInstruction.set(instruction.place.id, instruction);
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
}
