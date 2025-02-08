import { ReturnTerminal } from '../../ir/core/Terminal.js';
import { StoreLocalInstruction } from '../../ir/instructions/memory/StoreLocal.js';
import { ArrayPatternInstruction } from '../../ir/instructions/pattern/ArrayPattern.js';
import { ArrayExpressionInstruction } from '../../ir/instructions/value/ArrayExpression.js';
import { CallExpressionInstruction } from '../../ir/instructions/value/CallExpression.js';
import 'lodash-es';
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
        const instrs = [];
        this.inlineFunctionParams(funcIR, callExpressionInstr, environment, instrs, rewriteMap);
        const block = funcIR.blocks.values().next().value;
        for (const instr of block.instructions) {
            const clonedInstr = instr.clone(environment);
            rewriteMap.set(instr.place.identifier, clonedInstr.place);
            instrs.push(clonedInstr.rewrite(rewriteMap));
        }
        if (block.terminal instanceof ReturnTerminal) {
            callExpressionBlock.instructions[index] =
                callExpressionInstr.rewrite(rewriteMap);
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
                callExpressionBlock.instructions[i] = oldInstr.rewrite(retRewriteMap);
            }
        }
    }
    inlineFunctionParams(funcIR, callExpressionInstr, environment, instrs, rewriteMap) {
        for (const instr of funcIR.header) {
            const clonedInstr = instr.clone(environment);
            rewriteMap.set(instr.place.identifier, clonedInstr.place);
            instrs.push(clonedInstr.rewrite(rewriteMap));
        }
        const leftElements = [];
        for (let i = 0; i < funcIR.params.length; i++) {
            const paramPlace = funcIR.params[i];
            const elementPlace = rewriteMap.get(paramPlace.identifier);
            leftElements.push(elementPlace);
            rewriteMap.set(paramPlace.identifier, elementPlace);
        }
        const leftArrayPatternIdentifier = environment.createIdentifier();
        const leftArrayPatternPlace = environment.createPlace(leftArrayPatternIdentifier);
        const leftArrayPattern = environment.createInstruction(ArrayPatternInstruction, leftArrayPatternPlace, undefined, leftElements);
        const rightElements = [];
        for (let i = 0; i < callExpressionInstr.args.length; i++) {
            const argPlace = callExpressionInstr.args[i];
            rightElements.push(argPlace);
        }
        const rightArrayPatternIdentifier = environment.createIdentifier();
        const rightArrayPatternPlace = environment.createPlace(rightArrayPatternIdentifier);
        const rightArrayPattern = environment.createInstruction(ArrayExpressionInstruction, rightArrayPatternPlace, undefined, rightElements);
        const storeLocalIdentifier = environment.createIdentifier();
        const storeLocalPlace = environment.createPlace(storeLocalIdentifier);
        const storeLocalInstr = environment.createInstruction(StoreLocalInstruction, storeLocalPlace, undefined, leftArrayPatternPlace, rightArrayPatternPlace, "const");
        instrs.push(leftArrayPattern, rightArrayPattern, storeLocalInstr);
    }
}

export { FunctionInliningPass };
//# sourceMappingURL=FunctionInliningPass.js.map
