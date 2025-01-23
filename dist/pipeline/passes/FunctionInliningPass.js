import { ReturnTerminal } from '../../ir/core/Terminal.js';
import 'lodash-es';
import { CallExpressionInstruction } from '../../ir/instructions/value/CallExpression.js';
import { BaseOptimizationPass } from '../late-optimizer/OptimizationPass.js';

/**
 * A pass that inlines calls to small or trivial functions directly into the
 * calling site, removing function-call overhead and enabling further optimizations
 * like constant propagation. For example:
 *
 * ```js
 * function foo(x) { return x + 1; }
 *
 * function bar() {
 *   const a = 5;
 *   return foo(a);
 * }
 * ```
 *
 * Will be transformed into:
 * ```js
 * function bar() {
 *   const a = 5;
 *   return a + 1;
 * }
 * ```
 */
class FunctionInliningPass extends BaseOptimizationPass {
    functionIR;
    moduleIR;
    callGraph;
    projectUnit;
    constructor(functionIR, moduleIR, callGraph, projectUnit) {
        super(functionIR);
        this.functionIR = functionIR;
        this.moduleIR = moduleIR;
        this.callGraph = callGraph;
        this.projectUnit = projectUnit;
    }
    step() {
        let changed = false;
        for (const [, block] of this.functionIR.blocks) {
            for (const [index, instr] of block.instructions.entries()) {
                if (!(instr instanceof CallExpressionInstruction)) {
                    continue;
                }
                const calleeIR = this.callGraph.resolveFunctionFromCallExpression(this.moduleIR, instr);
                if (calleeIR === undefined) {
                    continue;
                }
                const { modulePath, functionIRId } = calleeIR;
                const moduleIR = this.projectUnit.modules.get(modulePath);
                if (!moduleIR) {
                    continue;
                }
                const functionIR = moduleIR.functions.get(functionIRId);
                if (!functionIR) {
                    continue;
                }
                if (!this.isInlinableFunction(functionIR)) {
                    continue;
                }
                this.inlineFunctionIR(index, block, functionIR, this.moduleIR.environment);
            }
        }
        return { changed };
    }
    /**
     * Checks whether the function is inlinable:
     * - Must have exactly one block
     * - Must not be recursive
     */
    isInlinableFunction(funcIR) {
        if (funcIR.blocks.size > 1) {
            return false;
        }
        if (this.isFunctionRecursive(funcIR)) {
            console.log("Function is recursive", this.moduleIR.functions.size);
            return false;
        }
        return true;
    }
    /**
     * Checks if `funcIR` is part of a recursion cycle (direct or indirect).
     * We do a depth-first search on the call graph from `funcIR.id`,
     * returning `true` if we revisit the start function via any call chain.
     *
     * @param funcIR - The FunctionIR we want to test for recursion
     */
    isFunctionRecursive(funcIR) {
        const start = funcIR.id;
        const visited = new Set();
        const stack = new Set();
        const dfs = (current) => {
            // If 'current' is already on the call stack, we've found a cycle
            if (stack.has(current)) {
                return true;
            }
            // If 'current' was fully visited before, no cycle found from this node
            if (visited.has(current)) {
                return false;
            }
            visited.add(current);
            stack.add(current);
            const neighbors = this.callGraph.calls.get(this.moduleIR.path)?.get(current) ?? new Set();
            for (const neighbor of neighbors) {
                if (dfs(neighbor.functionIRId)) {
                    return true;
                }
            }
            // Done exploring this path
            stack.delete(current);
            return false;
        };
        // Start DFS from the function's ID
        return dfs(start);
    }
    inlineFunctionIR(index, callExpressionBlock, funcIR, environment) {
        if (funcIR.blocks.size > 1) {
            throw new Error("Function has multiple blocks");
        }
        const callExpressionInstr = callExpressionBlock.instructions[index];
        if (!(callExpressionInstr instanceof CallExpressionInstruction)) {
            throw new Error("Expected CallExpressionInstruction");
        }
        const rewriteMap = new Map();
        for (let i = 0; i < funcIR.params.length; i++) {
            rewriteMap.set(funcIR.params[i].identifier, callExpressionInstr.args[i]);
        }
        const instrs = [];
        const block = funcIR.blocks.values().next().value;
        for (const instr of block.instructions) {
            const clonedInstr = instr.clone(environment);
            rewriteMap.set(instr.place.identifier, clonedInstr.place);
            instrs.push(clonedInstr.rewriteInstruction(rewriteMap));
        }
        if (block.terminal instanceof ReturnTerminal) {
            callExpressionBlock.instructions[index] =
                callExpressionInstr.rewriteInstruction(rewriteMap);
        }
        let returnPlace = undefined;
        if (block.terminal instanceof ReturnTerminal) {
            const oldReturnId = block.terminal.value.identifier;
            returnPlace = rewriteMap.get(oldReturnId);
            if (!returnPlace) {
                throw new Error("Could not find a rewritten place for the function's return value");
            }
        }
        callExpressionBlock.instructions.splice(index, 1, ...instrs);
        if (returnPlace) {
            const retRewriteMap = new Map();
            retRewriteMap.set(callExpressionInstr.place.identifier, returnPlace);
            for (let i = index + instrs.length; i < callExpressionBlock.instructions.length; i++) {
                const oldInstr = callExpressionBlock.instructions[i];
                callExpressionBlock.instructions[i] =
                    oldInstr.rewriteInstruction(retRewriteMap);
            }
        }
    }
}

export { FunctionInliningPass };
//# sourceMappingURL=FunctionInliningPass.js.map
