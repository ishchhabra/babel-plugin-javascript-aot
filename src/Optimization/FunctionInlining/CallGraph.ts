import { Bindings } from "../../HIR";
import { BasicBlock, BlockId } from "../../HIR/Block";
import { resolveBinding } from "../../HIR/HIRBuilder";
import { IdentifierId } from "../../HIR/Identifier";
import {
  CallExpressionInstruction,
  FunctionDeclarationInstruction,
} from "../../HIR/Instruction";

/**
 * A call graph is a directed graph where each node represents a function declaration
 * and each edge represents a call to a function from another function.
 */
export class CallGraph {
  /**
   * Map of function declarations to their corresponding FunctionDeclarationInstruction
   */
  #nodes: Map<IdentifierId, FunctionDeclarationInstruction> = new Map();

  /**
   * Maps function IDs to the set of functions they call.
   */
  #edges: Map<IdentifierId, Set<IdentifierId>> = new Map();

  constructor(bindings: Bindings, blocks: Map<BlockId, BasicBlock>) {
    this.#registerFunctions(blocks);
    this.#registerCalls(bindings, blocks);
  }

  #registerFunctions(blocks: Map<BlockId, BasicBlock>): void {
    for (const [, block] of blocks) {
      for (const instruction of block.instructions) {
        if (instruction instanceof FunctionDeclarationInstruction) {
          this.#nodes.set(instruction.target.identifier.id, instruction);
        }
      }
    }
  }

  #registerCalls(bindings: Bindings, blocks: Map<BlockId, BasicBlock>): void {
    for (const [, block] of blocks) {
      for (const instruction of block.instructions) {
        if (instruction instanceof CallExpressionInstruction) {
          this.#registerCall(bindings, instruction, block, blocks);
        }
      }
    }
  }

  #registerCall(
    bindings: Bindings,
    instruction: CallExpressionInstruction,
    block: BasicBlock,
    blocks: Map<BlockId, BasicBlock>,
  ): void {
    try {
      const functionDeclarationPlace = resolveBinding(
        bindings,
        blocks,
        instruction.callee.identifier.declarationId,
        block.id,
      );
      const functionId = this.#getEnclosingFunction(block, blocks);
      if (functionId !== undefined) {
        this.#addCall(functionId, functionDeclarationPlace.identifier.id);
      }
    } catch (e) {}
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

  #addCall(caller: IdentifierId, callee: IdentifierId): void {
    let edges = this.#edges.get(caller);
    if (edges === undefined) {
      edges = new Set([]);
      this.#edges.set(caller, edges);
    }

    edges.add(callee);
  }

  /**
   * Returns the function declaration for the given function ID.
   */
  getFunctionDeclaration(
    functionId: IdentifierId,
  ): FunctionDeclarationInstruction | undefined {
    return this.#nodes.get(functionId);
  }

  /**
   * Checks if a function is recursive by performing a depth-first search
   * to see if the function calls itself either directly or indirectly.
   */
  isFunctionRecursive(functionId: IdentifierId): boolean {
    const visited = new Set<IdentifierId>();
    const recursionStack = new Set<IdentifierId>();

    const dfs = (currentId: IdentifierId): boolean => {
      if (recursionStack.has(currentId)) {
        return true;
      }

      if (visited.has(currentId)) {
        return false;
      }

      visited.add(currentId);
      recursionStack.add(currentId);

      const callees = this.#edges.get(currentId);
      if (callees) {
        for (const callee of callees) {
          if (dfs(callee)) {
            return true;
          }
        }
      }

      recursionStack.delete(currentId);
      return false;
    };

    return dfs(functionId);
  }
}
