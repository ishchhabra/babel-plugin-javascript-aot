"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallGraph = void 0;
class CallGraph {
    #nodes = new Map();
    #edges = new Map();
    static fromBlocks(blocks) {
        const callGraph = new CallGraph();
        callGraph.#registerFunctions(blocks);
        callGraph.#registerCalls(blocks);
        return callGraph;
    }
    getFunctionDeclarations() {
        return this.#nodes;
    }
    addFunction(funcId, instruction) {
        this.#nodes.set(funcId, instruction);
    }
    addCall(funcId, calleeId) {
        const edges = this.#edges.get(funcId);
        if (edges === undefined) {
            this.#edges.set(funcId, new Set([calleeId]));
        }
        else {
            edges.add(calleeId);
        }
    }
    isFunctionRecursive(funcId) {
        const visited = new Set();
        const stack = new Set();
        const dfs = (currentFuncId) => {
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
    #registerFunctions(blocks) {
        for (const [, block] of blocks.entries()) {
            for (const instruction of block.instructions) {
                if (instruction.kind === "FunctionDeclaration") {
                    const identifierId = instruction.target.identifier.id;
                    this.#nodes.set(identifierId, instruction);
                }
            }
        }
    }
    #registerCalls(blocks) {
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
    #getEnclosingFunction(block, blocks) {
        const functionDeclaration = Array.from(this.#nodes.values()).find((instruction) => {
            let currentBlock = block;
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
        });
        if (!functionDeclaration) {
            return undefined;
        }
        return functionDeclaration.target.identifier.id;
    }
}
exports.CallGraph = CallGraph;
