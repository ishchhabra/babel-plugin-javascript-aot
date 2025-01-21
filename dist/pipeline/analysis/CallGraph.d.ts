import { ProjectUnit } from "../../frontend/ProjectBuilder";
import { CallExpressionInstruction } from "../../ir";
import { FunctionIR, FunctionIRId } from "../../ir/core/FunctionIR";
/**
 * A project-wide call graph that stores:
 *  - Forward edges (calls): (modulePath) => (functionId => set of callees)
 *  - Reverse edges (callers): (modulePath) => (functionId => set of callers)
 *  - Declarations: (modulePath) => (declarationId => functionId)
 */
export declare class CallGraph {
    private readonly projectUnit;
    /**
     * For each module path => a map of:
     *   FunctionIRId => Set of {modulePath, functionIRId} it calls
     */
    readonly calls: Map<string, // module path
    Map<FunctionIRId, Set<{
        modulePath: string;
        functionIRId: FunctionIRId;
    }>>>;
    /**
     * The reverse of `calls`:
     *   For each module path => a map of FunctionIRId => who calls it
     */
    readonly callers: Map<string, Map<FunctionIRId, Set<{
        modulePath: string;
        functionIRId: FunctionIRId;
    }>>>;
    /**
     * For each module path => a map of:
     *   DeclarationId => FunctionIRId
     * representing which function declares each variable ID.
     */
    private readonly declarations;
    constructor(projectUnit: ProjectUnit);
    /**
     * Walks each function in the module, locates CallExpressionInstructions,
     * and fills in both forward (calls) and reverse (callers) edges.
     */
    private gatherDeclarations;
    /**
     * Step 3 helper: walk through each function in `moduleIR` to find
     * call instructions, then fill in the forward calls and reverse callers.
     */
    private gatherCalls;
    /**
     * Inserts a forward edge (caller->callee) into 'calls' and a reverse edge
     * (callee->caller) into 'callers'.
     */
    private addCall;
    /**
     * Resolves the callee's FunctionIR for a given call expression in `modulePath`.
     * Currently, it only looks up declarations within the *same* module.
     *
     * If the callee is found, returns that FunctionIR; otherwise, undefined.
     */
    resolveFunctionFromCallExpression(modulePath: string, callExpression: CallExpressionInstruction): FunctionIR | undefined;
    /**
     * Forward lookup: "Given (modulePath, functionId), which functions does it call?"
     */
    getCallees(modulePath: string, functionId: FunctionIRId): Set<{
        modulePath: string;
        functionIRId: FunctionIRId;
    }>;
    /**
     * Reverse lookup: "Given (modulePath, functionId), who calls it?"
     */
    getCallers(modulePath: string, functionId: FunctionIRId): Set<{
        modulePath: string;
        functionIRId: FunctionIRId;
    }>;
}
