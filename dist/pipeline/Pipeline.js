import { LateOptimizer } from './late-optimizer/LateOptimizer.js';
import { MergeConsecutiveBlocksPass } from './MergeConsecutiveBlocksPass.js';
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
            const moduleIR = this.projectUnit.modules.get(moduleName);
            for (const functionIR of moduleIR.functions.values()) {
                new MergeConsecutiveBlocksPass(functionIR, moduleIR).run();
                const ssaBuilderResult = new SSABuilder(functionIR, moduleIR).build();
                if (this.options.enableOptimizer) {
                    const optimizerResult = new Optimizer(functionIR, moduleIR, this.projectUnit, this.options, context).run();
                    functionIR.blocks = optimizerResult.blocks;
                }
                new SSAEliminator(functionIR, moduleIR, ssaBuilderResult.phis).eliminate();
                if (this.options.enableLateOptimizer) {
                    const lateOptimizerResult = new LateOptimizer(functionIR, this.projectUnit, this.options).run();
                    functionIR.blocks = lateOptimizerResult.blocks;
                }
            }
        }
        return this.projectUnit;
    }
}

export { Pipeline };
//# sourceMappingURL=Pipeline.js.map
