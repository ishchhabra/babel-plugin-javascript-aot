import { Environment } from "../../environment";
import { ProjectUnit } from "../../frontend/ProjectBuilder";
import { BasicBlock, ReturnTerminal } from "../../ir";
import { FunctionIR, FunctionIRId } from "../../ir/core/FunctionIR";
import { Identifier } from "../../ir/core/Identifier";
import { ModuleIR } from "../../ir/core/ModuleIR";
import { Place } from "../../ir/core/Place";
import { CallExpressionInstruction } from "../../ir/instructions/value/CallExpression";
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
export class FunctionInliningPass extends BaseOptimizationPass {
  constructor(
    protected readonly functionIR: FunctionIR,
    private readonly moduleIR: ModuleIR,
    private readonly callGraph: CallGraph,
    private readonly projectUnit: ProjectUnit,
  ) {
    super(functionIR);
  }

  public step() {
    let changed = false;

    for (const [, block] of this.functionIR.blocks) {
      for (const [index, instr] of block.instructions.entries()) {
        if (!(instr instanceof CallExpressionInstruction)) {
          continue;
        }

        const calleeIR = this.callGraph.resolveFunctionFromCallExpression(
          this.moduleIR,
          instr,
        );
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

        this.inlineFunctionIR(
          index,
          block,
          functionIR,
          this.moduleIR.environment,
        );
      }
    }

    return { changed };
  }

  /**
   * Checks whether the function is inlinable:
   * - Must have exactly one block
   * - Must not be recursive
   */
  private isInlinableFunction(funcIR: FunctionIR): boolean {
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
  private isFunctionRecursive(funcIR: FunctionIR): boolean {
    const start = funcIR.id;
    const visited = new Set<FunctionIRId>();
    const stack = new Set<FunctionIRId>();

    const dfs = (current: FunctionIRId): boolean => {
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

      const neighbors =
        this.callGraph.calls.get(this.moduleIR.path)?.get(current) ?? new Set();
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

  private inlineFunctionIR(
    index: number,
    callExpressionBlock: BasicBlock,
    funcIR: FunctionIR,
    environment: Environment,
  ) {
    if (funcIR.blocks.size > 1) {
      throw new Error("Function has multiple blocks");
    }

    const callExpressionInstr = callExpressionBlock.instructions[index];
    if (!(callExpressionInstr instanceof CallExpressionInstruction)) {
      throw new Error("Expected CallExpressionInstruction");
    }

    const rewriteMap = new Map<Identifier, Place>();
    for (let i = 0; i < funcIR.params.length; i++) {
      rewriteMap.set(funcIR.params[i].identifier, callExpressionInstr.args[i]);
    }

    const instrs = [];
    const block = funcIR.blocks.values().next().value!;
    for (const instr of block.instructions) {
      const clonedInstr = instr.clone(environment);
      rewriteMap.set(instr.place.identifier, clonedInstr.place);
      instrs.push(clonedInstr.rewrite(rewriteMap));
    }

    if (block.terminal instanceof ReturnTerminal) {
      callExpressionBlock.instructions[index] =
        callExpressionInstr.rewrite(rewriteMap);
    }

    let returnPlace: Place | undefined = undefined;
    if (block.terminal instanceof ReturnTerminal) {
      const oldReturnId = block.terminal.value.identifier;
      returnPlace = rewriteMap.get(oldReturnId);

      if (!returnPlace) {
        throw new Error(
          "Could not find a rewritten place for the function's return value",
        );
      }
    }

    callExpressionBlock.instructions.splice(index, 1, ...instrs);

    if (returnPlace) {
      const retRewriteMap = new Map<Identifier, Place>();
      retRewriteMap.set(callExpressionInstr.place.identifier, returnPlace);

      for (
        let i = index + instrs.length;
        i < callExpressionBlock.instructions.length;
        i++
      ) {
        const oldInstr = callExpressionBlock.instructions[i];
        callExpressionBlock.instructions[i] = oldInstr.rewrite(retRewriteMap);
      }
    }
  }
}
