import { BasicBlock, BlockId } from "../../HIR/Block";
import { IdentifierId } from "../../HIR/Identifier";
import { FunctionDeclarationInstruction } from "../../HIR/Instruction";

export class CallGraph {
  #nodes: Map<IdentifierId, FunctionDeclarationInstruction> = new Map();
  #edges: Map<IdentifierId, Set<IdentifierId>> = new Map();

  static fromBlocks(blocks: Map<BlockId, BasicBlock>): CallGraph {
    const callGraph = new CallGraph();
    callGraph.#registerFunctions(blocks);
    callGraph.#registerCalls(blocks);
    return callGraph;
  }

  getFunctionDeclarations(): Map<IdentifierId, FunctionDeclarationInstruction> {
    return this.#nodes;
  }

  addFunction(
    funcId: IdentifierId,
    instruction: FunctionDeclarationInstruction,
  ) {
    this.#nodes.set(funcId, instruction);
  }

  addCall(funcId: IdentifierId, calleeId: IdentifierId) {
    const edges = this.#edges.get(funcId);
    if (edges === undefined) {
      this.#edges.set(funcId, new Set([calleeId]));
    } else {
      edges.add(calleeId);
    }
  }

  isFunctionRecursive(funcId: IdentifierId): boolean {
    const visited = new Set<IdentifierId>();
    const stack = new Set<IdentifierId>();

    const dfs = (currentFuncId: IdentifierId): boolean => {
      if (stack.has(currentFuncId)) {
        return true; // Found a cycle in the call graph
      }

      if (visited.has(currentFuncId)) {
        return false;
      }

      visited.add(currentFuncId);
      stack.add(currentFuncId);

      const callees = this.#edges.get(currentFuncId);
      if (callees) {
        for (const callee of callees) {
          // Check for direct recursion
          if (callee === funcId) {
            return true;
          }

          // Check for indirect recursion
          if (dfs(callee)) {
            return true;
          }
        }
      }

      stack.delete(currentFuncId);
      return false;
    };

    return dfs(funcId);
  }

  /**
   * Register all functions in the given blocks.
   */
  #registerFunctions(blocks: Map<BlockId, BasicBlock>) {
    for (const [, block] of blocks.entries()) {
      for (const instruction of block.instructions) {
        if (instruction.kind === "FunctionDeclaration") {
          const identifierId = instruction.target.identifier.id;
          this.#nodes.set(identifierId, instruction);
        }
      }
    }
  }

  #registerCalls(blocks: Map<BlockId, BasicBlock>) {
    for (const [, block] of blocks.entries()) {
      for (const instruction of block.instructions) {
        if (instruction.kind === "CallExpression") {
          const calleeId = instruction.callee.identifier.id;
          const enclosingFuncId = this.#getEnclosingFunction(block, blocks);
          if (enclosingFuncId !== undefined) {
            this.addCall(enclosingFuncId, calleeId);
          }
        }
      }
    }
  }

  #getEnclosingFunction(
    block: BasicBlock,
    blocks: Map<BlockId, BasicBlock>,
  ): IdentifierId | undefined {
    const functionDeclaration = Array.from(this.#nodes.values()).find(
      (instruction) => {
        let currentBlock: BasicBlock | undefined = block;
        while (currentBlock) {
          if (currentBlock.id === instruction.body) {
            return true;
          }
          currentBlock =
            currentBlock.parent !== undefined
              ? blocks.get(currentBlock.parent)
              : undefined;
        }
        return false;
      },
    );

    if (!functionDeclaration) {
      return undefined;
    }

    return functionDeclaration.target.identifier.id;
  }
}
