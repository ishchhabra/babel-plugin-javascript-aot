import { ConstantPropagationPass } from '../passes/ConstantPropagationPass.js';

class Optimizer {
    functionIR;
    moduleIR;
    ssa;
    projectUnit;
    options;
    context;
    constructor(functionIR, moduleIR, ssa, projectUnit, options, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context) {
        this.functionIR = functionIR;
        this.moduleIR = moduleIR;
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
        return { blocks };
    }
}

export { Optimizer };
//# sourceMappingURL=Optimizer.js.map
