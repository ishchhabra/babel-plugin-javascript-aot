import { DeclarationId } from "../../ir";
import { FunctionIRId } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
import { FunctionDeclarationInstruction } from "../../ir/instructions/declaration/Function";
import { CallExpressionInstruction } from "../../ir/instructions/value/CallExpression";

export interface CallGraph {
  /**
   * Maps a function ID (the caller) to the set of function IDs it calls (the callees).
   */
  calls: Map<FunctionIRId, Set<FunctionIRId>>;

  /**
   * Maps a function declaration ID to the function ID that declares it.
   */
  declarations: Map<DeclarationId, FunctionIRId>;
}

export class CallGraphBuilder {
  constructor(private readonly moduleIR: ModuleIR) {}

  public build(): CallGraph {
    const declarations = this.getFunctionDeclarations();
    const calls = this.getCalls(declarations);
    return { calls, declarations };
  }

  private getFunctionDeclarations(): Map<DeclarationId, FunctionIRId> {
    const declarations = new Map<DeclarationId, FunctionIRId>();
    for (const [, funcIR] of this.moduleIR.functions) {
      for (const block of funcIR.blocks.values()) {
        for (const instr of block.instructions) {
          if (instr instanceof FunctionDeclarationInstruction) {
            declarations.set(
              instr.identifier.identifier.declarationId,
              instr.functionIR.id,
            );
          }
        }
      }
    }

    return declarations;
  }

  private getCalls(
    declarations: Map<DeclarationId, FunctionIRId>,
  ): Map<FunctionIRId, Set<FunctionIRId>> {
    const calls = new Map<FunctionIRId, Set<FunctionIRId>>();

    // Initialize calls[...] = empty Set for every function
    for (const [funcId] of this.moduleIR.functions) {
      calls.set(funcId, new Set<FunctionIRId>());
    }

    // Look for CallExpressionInstruction in each function’s blocks.
    // Check if the callee corresponds to a known function from Step 1.
    for (const [funcId, funcIR] of this.moduleIR.functions) {
      for (const block of funcIR.blocks.values()) {
        for (const instr of block.instructions) {
          if (instr instanceof CallExpressionInstruction) {
            const calleeFuncId = CallGraphBuilder.resolveFunctionIRId(
              instr,
              declarations,
            );
            if (calleeFuncId !== undefined) {
              calls.get(funcId)!.add(calleeFuncId);
            }
          }
        }
      }
    }

    return calls;
  }

  public static resolveFunctionIRId(
    instruction: CallExpressionInstruction,
    declarations: Map<DeclarationId, FunctionIRId>,
  ): FunctionIRId | undefined {
    const nodePath = instruction.nodePath;
    if (nodePath === undefined) {
      return undefined;
    }

    const calleePath = nodePath.get("callee");
    if (!calleePath.isIdentifier()) {
      return undefined;
    }

    const declarationId = nodePath.scope.getData(calleePath.node.name);
    if (declarationId === undefined) {
      return undefined;
    }

    return declarations.get(declarationId);
  }
}
