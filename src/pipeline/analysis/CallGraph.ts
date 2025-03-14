import { ProjectUnit } from "../../frontend/ProjectBuilder";
import {
  CallExpressionInstruction,
  DeclarationId,
  FunctionDeclarationInstruction,
  LoadGlobalInstruction,
} from "../../ir";
import { FunctionIRId } from "../../ir/core/FunctionIR";
import { ModuleGlobal, ModuleIR } from "../../ir/core/ModuleIR";

/**
 * A project-wide call graph that stores:
 *  - Forward edges (calls): (modulePath) => (functionId => set of callees)
 *  - Reverse edges (callers): (modulePath) => (functionId => set of callers)
 *  - Declarations: (modulePath) => (declarationId => functionId)
 */
export class CallGraph {
  /**
   * For each module path => a map of:
   *   FunctionIRId => Set of {modulePath, functionIRId} it calls
   */
  public readonly calls: Map<
    string, // module path
    Map<FunctionIRId, Set<{ modulePath: string; functionIRId: FunctionIRId }>>
  > = new Map();

  /**
   * The reverse of `calls`:
   *   For each module path => a map of FunctionIRId => who calls it
   */
  public readonly callers: Map<
    string,
    Map<FunctionIRId, Set<{ modulePath: string; functionIRId: FunctionIRId }>>
  > = new Map();

  /**
   * For each module path => a map of:
   *   DeclarationId => FunctionIRId
   * representing which function declares each variable ID.
   */
  private readonly declarations: Map<string, Map<DeclarationId, FunctionIRId>> =
    new Map();

  constructor(private readonly projectUnit: ProjectUnit) {
    // Initialize empty maps for each module.
    for (const modulePath of this.projectUnit.postOrder.toReversed()) {
      this.calls.set(modulePath, new Map());
      this.callers.set(modulePath, new Map());
      this.declarations.set(modulePath, new Map());
    }

    // Gather all declarations for each module (so we can resolve calls that reference them).
    for (const modulePath of this.projectUnit.postOrder.toReversed()) {
      const moduleIR = this.projectUnit.modules.get(modulePath)!;
      this.gatherDeclarations(moduleIR);
    }

    // Gather all calls (forward & reverse edges) for each module.
    for (const modulePath of this.projectUnit.postOrder.toReversed()) {
      const moduleIR = this.projectUnit.modules.get(modulePath)!;
      this.gatherCalls(moduleIR);
    }
  }

  /**
   * Walks each function in the module, locates CallExpressionInstructions,
   * and fills in both forward (calls) and reverse (callers) edges.
   */
  private gatherDeclarations(moduleIR: ModuleIR): void {
    const moduleDecls = this.declarations.get(moduleIR.path)!;

    for (const [, funcIR] of moduleIR.functions) {
      for (const block of funcIR.blocks.values()) {
        for (const instr of block.instructions) {
          if (!(instr instanceof FunctionDeclarationInstruction)) {
            continue;
          }
          moduleDecls.set(
            instr.identifier.identifier.declarationId,
            instr.functionIR.id,
          );
        }
      }
    }
  }

  /**
   * Step 3 helper: walk through each function in `moduleIR` to find
   * call instructions, then fill in the forward calls and reverse callers.
   */
  private gatherCalls(moduleIR: ModuleIR): void {
    const moduleCalls = this.calls.get(moduleIR.path)!;

    // Ensure each function has an entry in the forward calls and reverse callers,
    // so we don't end up with undefined in the map.
    for (const [, funcIR] of moduleIR.functions) {
      if (!moduleCalls.has(funcIR.id)) {
        moduleCalls.set(funcIR.id, new Set());
      }
      const moduleCallers = this.callers.get(moduleIR.path)!;
      if (!moduleCallers.has(funcIR.id)) {
        moduleCallers.set(funcIR.id, new Set());
      }
    }

    // Now find actual call instructions
    for (const [, funcIR] of moduleIR.functions) {
      for (const block of funcIR.blocks.values()) {
        for (const instr of block.instructions) {
          if (!(instr instanceof CallExpressionInstruction)) {
            continue;
          }

          const calleeIR = this.resolveFunctionFromCallExpression(
            moduleIR,
            instr,
          );
          if (calleeIR === undefined) {
            continue;
          }

          const calleeInstruction = moduleIR.environment.placeToInstruction.get(
            instr.callee.id,
          );
          if (calleeInstruction === undefined) {
            continue;
          }

          this.addCall(
            moduleIR.path,
            funcIR.id,
            calleeIR.modulePath,
            calleeIR.functionIRId,
          );
        }
      }
    }
  }

  /**
   * Inserts a forward edge (caller->callee) into 'calls' and a reverse edge
   * (callee->caller) into 'callers'.
   */
  private addCall(
    callerModulePath: string,
    callerId: FunctionIRId,
    calleeModulePath: string,
    calleeId: FunctionIRId,
  ): void {
    // 1) Forward edge
    const forwardMap = this.calls.get(callerModulePath)!;
    if (!forwardMap.has(callerId)) {
      forwardMap.set(callerId, new Set());
    }
    forwardMap
      .get(callerId)!
      .add({ modulePath: calleeModulePath, functionIRId: calleeId });

    // 2) Reverse edge
    const reverseMap = this.callers.get(calleeModulePath)!;
    if (!reverseMap.has(calleeId)) {
      reverseMap.set(calleeId, new Set());
    }
    reverseMap
      .get(calleeId)!
      .add({ modulePath: callerModulePath, functionIRId: callerId });
  }

  /**
   * Resolves the callee's FunctionIR for a given call expression in `modulePath`.
   * Currently, it only looks up declarations within the *same* module.
   *
   * If the callee is found, returns that FunctionIR; otherwise, undefined.
   */
  public resolveFunctionFromCallExpression(
    moduleIR: ModuleIR,
    callExpression: CallExpressionInstruction,
  ): { modulePath: string; functionIRId: FunctionIRId } | undefined {
    const nodePath = callExpression.nodePath;
    if (!nodePath) {
      return undefined;
    }

    const calleePath = nodePath.get("callee");
    if (!calleePath.isIdentifier()) {
      return undefined;
    }

    const name = calleePath.node.name;
    const loadInstr = moduleIR.environment.placeToInstruction.get(
      callExpression.callee.id,
    );

    if (loadInstr instanceof LoadGlobalInstruction) {
      const global = moduleIR.globals.get(name);
      if (global === undefined) {
        return undefined;
      }

      return this.resolveGlobalFunctionCall(global);
    }

    const declarationId = calleePath.scope.getData(calleePath.node.name);
    if (declarationId === undefined) {
      return undefined;
    }

    const declMap = this.declarations.get(moduleIR.path);
    if (!declMap) {
      return undefined;
    }

    const funcIRId = declMap.get(declarationId);
    if (funcIRId === undefined) {
      return undefined;
    }

    return {
      modulePath: moduleIR.path,
      functionIRId: funcIRId,
    };
  }

  public resolveGlobalFunctionCall(global: ModuleGlobal) {
    if (global.kind !== "import") {
      return undefined;
    }

    const { name, source } = global;
    const moduleIR = this.projectUnit.modules.get(source);
    if (moduleIR === undefined) {
      return undefined;
    }

    const exportPlace = moduleIR.exports.get(name);
    if (exportPlace === undefined) {
      return undefined;
    }

    const funcDeclInstr = moduleIR.environment.placeToInstruction.get(
      exportPlace.declaration.place.id,
    );
    if (!(funcDeclInstr instanceof FunctionDeclarationInstruction)) {
      return undefined;
    }

    return {
      modulePath: source,
      functionIRId: funcDeclInstr.functionIR.id,
    };
  }

  /**
   * Forward lookup: "Given (modulePath, functionId), which functions does it call?"
   */
  public getCallees(
    modulePath: string,
    functionId: FunctionIRId,
  ): Set<{ modulePath: string; functionIRId: FunctionIRId }> {
    return this.calls.get(modulePath)?.get(functionId) ?? new Set();
  }

  /**
   * Reverse lookup: "Given (modulePath, functionId), who calls it?"
   */
  public getCallers(
    modulePath: string,
    functionId: FunctionIRId,
  ): Set<{ modulePath: string; functionIRId: FunctionIRId }> {
    return this.callers.get(modulePath)?.get(functionId) ?? new Set();
  }
}
