import { ConstantPropagationPass } from '../passes/ConstantPropagationPass.js';
import { FunctionInliningPass } from '../passes/FunctionInliningPass.js';

class Optimizer {
    functionIR;
    moduleIR;
    callGraph;
    ssa;
    projectUnit;
    options;
    context;
    constructor(functionIR, moduleIR, callGraph, ssa, projectUnit, options, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context) {
        this.functionIR = functionIR;
        this.moduleIR = moduleIR;
        this.callGraph = callGraph;
        this.ssa = ssa;
        this.projectUnit = projectUnit;
        this.options = options;
        this.context = context;
    }
    run() {
        let blocks = this.functionIR.blocks;
        if (this.options.enableConstantPropagationPass) {
            const constantPropagationResult = new ConstantPropagationPass(this.functionIR, this.moduleIR, this.projectUnit, this.ssa, this.context).run();
            blocks = constantPropagationResult.blocks;
        }
        if (this.options.enableFunctionInliningPass) {
            const functionInliningResult = new FunctionInliningPass(this.functionIR, this.moduleIR, this.callGraph, this.projectUnit).run();
            blocks = functionInliningResult.blocks;
        }
        return { blocks };
    }
}

export { Optimizer };
//# sourceMappingURL=Optimizer.js.map
