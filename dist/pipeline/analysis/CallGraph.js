import { FunctionDeclarationInstruction } from '../../ir/instructions/declaration/Function.js';
import 'lodash-es';
import { CallExpressionInstruction } from '../../ir/instructions/value/CallExpression.js';

/**
 * A project-wide call graph that stores:
 *  - Forward edges (calls): (modulePath) => (functionId => set of callees)
 *  - Reverse edges (callers): (modulePath) => (functionId => set of callers)
 *  - Declarations: (modulePath) => (declarationId => functionId)
 */
class CallGraph {
    projectUnit;
    /**
     * For each module path => a map of:
     *   FunctionIRId => Set of {modulePath, functionIRId} it calls
     */
    calls = new Map();
    /**
     * The reverse of `calls`:
     *   For each module path => a map of FunctionIRId => who calls it
     */
    callers = new Map();
    /**
     * For each module path => a map of:
     *   DeclarationId => FunctionIRId
     * representing which function declares each variable ID.
     */
    declarations = new Map();
    constructor(projectUnit) {
        this.projectUnit = projectUnit;
        // Initialize empty maps for each module.
        for (const modulePath of this.projectUnit.postOrder.toReversed()) {
            this.calls.set(modulePath, new Map());
            this.callers.set(modulePath, new Map());
            this.declarations.set(modulePath, new Map());
        }
        // Gather all declarations for each module (so we can resolve calls that reference them).
        for (const modulePath of this.projectUnit.postOrder.toReversed()) {
            const moduleIR = this.projectUnit.modules.get(modulePath);
            this.gatherDeclarations(moduleIR);
        }
        // Gather all calls (forward & reverse edges) for each module.
        for (const modulePath of this.projectUnit.postOrder.toReversed()) {
            const moduleIR = this.projectUnit.modules.get(modulePath);
            this.gatherCalls(moduleIR);
        }
    }
    /**
     * Walks each function in the module, locates CallExpressionInstructions,
     * and fills in both forward (calls) and reverse (callers) edges.
     */
    gatherDeclarations(moduleIR) {
        const moduleDecls = this.declarations.get(moduleIR.path);
        for (const [, funcIR] of moduleIR.functions) {
            for (const block of funcIR.blocks.values()) {
                for (const instr of block.instructions) {
                    if (!(instr instanceof FunctionDeclarationInstruction)) {
                        continue;
                    }
                    moduleDecls.set(instr.identifier.identifier.declarationId, instr.functionIR.id);
                }
            }
        }
    }
    /**
     * Step 3 helper: walk through each function in `moduleIR` to find
     * call instructions, then fill in the forward calls and reverse callers.
     */
    gatherCalls(moduleIR) {
        const moduleCalls = this.calls.get(moduleIR.path);
        // Ensure each function has an entry in the forward calls and reverse callers,
        // so we don't end up with undefined in the map.
        for (const [, funcIR] of moduleIR.functions) {
            if (!moduleCalls.has(funcIR.id)) {
                moduleCalls.set(funcIR.id, new Set());
            }
            const moduleCallers = this.callers.get(moduleIR.path);
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
                    const calleeIR = this.resolveFunctionFromCallExpression(moduleIR.path, instr);
                    if (calleeIR === undefined) {
                        continue;
                    }
                    this.addCall(moduleIR.path, funcIR.id, moduleIR.path, calleeIR.id);
                }
            }
        }
    }
    /**
     * Inserts a forward edge (caller->callee) into 'calls' and a reverse edge
     * (callee->caller) into 'callers'.
     */
    addCall(callerModulePath, callerId, calleeModulePath, calleeId) {
        // 1) Forward edge
        const forwardMap = this.calls.get(callerModulePath);
        if (!forwardMap.has(callerId)) {
            forwardMap.set(callerId, new Set());
        }
        forwardMap
            .get(callerId)
            .add({ modulePath: calleeModulePath, functionIRId: calleeId });
        // 2) Reverse edge
        const reverseMap = this.callers.get(calleeModulePath);
        if (!reverseMap.has(calleeId)) {
            reverseMap.set(calleeId, new Set());
        }
        reverseMap
            .get(calleeId)
            .add({ modulePath: callerModulePath, functionIRId: callerId });
    }
    /**
     * Resolves the callee's FunctionIR for a given call expression in `modulePath`.
     * Currently, it only looks up declarations within the *same* module.
     *
     * If the callee is found, returns that FunctionIR; otherwise, undefined.
     */
    resolveFunctionFromCallExpression(modulePath, callExpression) {
        const nodePath = callExpression.nodePath;
        if (!nodePath) {
            return undefined;
        }
        const calleePath = nodePath.get("callee");
        if (!calleePath.isIdentifier()) {
            return undefined;
        }
        const declarationId = calleePath.scope.getData(calleePath.node.name);
        if (declarationId === undefined) {
            return undefined;
        }
        const declMap = this.declarations.get(modulePath);
        if (!declMap) {
            return undefined;
        }
        const funcIRId = declMap.get(declarationId);
        if (funcIRId === undefined) {
            return undefined;
        }
        return this.projectUnit.modules.get(modulePath)?.functions.get(funcIRId);
    }
    /**
     * Forward lookup: "Given (modulePath, functionId), which functions does it call?"
     */
    getCallees(modulePath, functionId) {
        return this.calls.get(modulePath)?.get(functionId) ?? new Set();
    }
    /**
     * Reverse lookup: "Given (modulePath, functionId), who calls it?"
     */
    getCallers(modulePath, functionId) {
        return this.callers.get(modulePath)?.get(functionId) ?? new Set();
    }
}

export { CallGraph };
//# sourceMappingURL=CallGraph.js.map
