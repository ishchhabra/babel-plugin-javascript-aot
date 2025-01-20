import { FunctionIR } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
import { CallGraph } from "../analysis/CallGraph";
import { BaseOptimizationPass } from "../late-optimizer/OptimizationPass";
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
export declare class FunctionInliningPass extends BaseOptimizationPass {
    protected readonly functionIR: FunctionIR;
    private readonly moduleIR;
    private readonly callGraph;
    constructor(functionIR: FunctionIR, moduleIR: ModuleIR, callGraph: CallGraph);
    step(): {
        changed: boolean;
    };
    /**
     * Checks whether the function is inlinable:
     * - Must have exactly one block
     * - Must not be recursive
     */
    private isInlinableFunction;
    /**
     * Checks if `funcIR` is part of a recursion cycle (direct or indirect).
     * We do an inlined depth-first search on the call graph from `funcIR.id`,
     * returning `true` if we revisit the start function via any call chain.
     *
     * @param funcIR - The FunctionIR we want to test for recursion
     */
    private isFunctionRecursive;
    private inlineFunctionIR;
}
