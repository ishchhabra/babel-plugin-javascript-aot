import { ConstantPropagationPass } from '../passes/ConstantPropagationPass.js';

class Optimizer {
    moduleUnit;
    projectUnit;
    options;
    context;
    constructor(moduleUnit, projectUnit, options, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context) {
        this.moduleUnit = moduleUnit;
        this.projectUnit = projectUnit;
        this.options = options;
        this.context = context;
    }
    run() {
        let blocks = this.moduleUnit.blocks;
        if (this.options.enableConstantPropagationPass) {
            const constantPropagationResult = new ConstantPropagationPass(this.moduleUnit, this.projectUnit, this.context).run();
            blocks = constantPropagationResult.blocks;
        }
        return { blocks };
    }
}

export { Optimizer };
//# sourceMappingURL=Optimizer.js.map
