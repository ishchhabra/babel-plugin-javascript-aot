import { DeclarationId } from "../../ir";
import { FunctionIRId } from "../../ir/core/FunctionIR";
import { ModuleIR } from "../../ir/core/ModuleIR";
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
export declare class CallGraphBuilder {
    private readonly moduleIR;
    constructor(moduleIR: ModuleIR);
    build(): CallGraph;
    private getFunctionDeclarations;
    private getCalls;
    static resolveFunctionIRId(instruction: CallExpressionInstruction, declarations: Map<DeclarationId, FunctionIRId>): FunctionIRId | undefined;
}
