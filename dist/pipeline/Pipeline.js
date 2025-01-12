import { ConstantPropagationPass } from './passes/ConstantPropagationPass.js';
import { SSABuilder } from './ssa/SSABuilder.js';
import { SSAEliminator } from './ssa/SSAEliminator.js';

class Pipeline {
    projectUnit;
    options;
    constructor(projectUnit, options) {
        this.projectUnit = projectUnit;
        this.options = options;
    }
    run() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const context = new Map();
        for (const moduleName of this.projectUnit.postOrder.toReversed()) {
            const moduleUnit = this.projectUnit.modules.get(moduleName);
            const ssaBuilderResult = new SSABuilder(moduleUnit).build();
            new SSAEliminator(moduleUnit, ssaBuilderResult.phis).eliminate();
            if (this.options.enableConstantPropagationPass) {
                const constantPropagationResult = new ConstantPropagationPass(moduleUnit, this.projectUnit, context).run();
                moduleUnit.blocks = constantPropagationResult.blocks;
            }
        }
        return this.projectUnit;
    }
}

export { Pipeline };
//# sourceMappingURL=Pipeline.js.map
