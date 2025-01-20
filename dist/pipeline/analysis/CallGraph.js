import { FunctionDeclarationInstruction } from '../../ir/instructions/declaration/Function.js';
import { CallExpressionInstruction } from '../../ir/instructions/value/CallExpression.js';

class CallGraphBuilder {
    moduleIR;
    constructor(moduleIR) {
        this.moduleIR = moduleIR;
    }
    build() {
        const declarations = this.getFunctionDeclarations();
        const calls = this.getCalls(declarations);
        return { calls, declarations };
    }
    getFunctionDeclarations() {
        const declarations = new Map();
        for (const [, funcIR] of this.moduleIR.functions) {
            for (const block of funcIR.blocks.values()) {
                for (const instr of block.instructions) {
                    if (instr instanceof FunctionDeclarationInstruction) {
                        declarations.set(instr.identifier.identifier.declarationId, instr.functionIR.id);
                    }
                }
            }
        }
        return declarations;
    }
    getCalls(declarations) {
        const calls = new Map();
        // Initialize calls[...] = empty Set for every function
        for (const [funcId] of this.moduleIR.functions) {
            calls.set(funcId, new Set());
        }
        // Look for CallExpressionInstruction in each function’s blocks.
        // Check if the callee corresponds to a known function from Step 1.
        for (const [funcId, funcIR] of this.moduleIR.functions) {
            for (const block of funcIR.blocks.values()) {
                for (const instr of block.instructions) {
                    if (instr instanceof CallExpressionInstruction) {
                        const calleeFuncId = CallGraphBuilder.resolveFunctionIRId(instr, declarations);
                        if (calleeFuncId !== undefined) {
                            calls.get(funcId).add(calleeFuncId);
                        }
                    }
                }
            }
        }
        return calls;
    }
    static resolveFunctionIRId(instruction, declarations) {
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

export { CallGraphBuilder };
//# sourceMappingURL=CallGraph.js.map
