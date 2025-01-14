import { LateOptimizer } from './late-optimizer/LateOptimizer.js';
import { Optimizer } from './optimizer/Optimizer.js';
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
            if (this.options.enableOptimizer) {
                const optimizerResult = new Optimizer(moduleUnit, this.projectUnit, this.options, context).run();
                moduleUnit.blocks = optimizerResult.blocks;
            }
            if (this.options.enableLateOptimizer) {
                const lateOptimizerResult = new LateOptimizer(moduleUnit, this.projectUnit, this.options).run();
                moduleUnit.blocks = lateOptimizerResult.blocks;
            }
        }
        return this.projectUnit;
    }
}

export { Pipeline };
//# sourceMappingURL=Pipeline.js.map
