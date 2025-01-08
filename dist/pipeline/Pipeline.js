import { ConstantPropagationPass } from './passes/ConstantPropagationPass.js';
import { SSABuilder } from './ssa/SSABuilder.js';
import { SSAEliminator } from './ssa/SSAEliminator.js';

class Pipeline {
    options;
    constructor(options) {
        this.options = options;
    }
    run(path, blocks, predecessors, dominators, dominanceFrontier, environment) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const context = new Map();
        const ssaBuilderResult = new SSABuilder(predecessors, dominanceFrontier, environment).build();
        new SSAEliminator(environment, blocks, dominators, ssaBuilderResult.phis).eliminate();
        if (this.options.enableConstantPropagationPass) {
            const constantPropagationResult = new ConstantPropagationPass(path, blocks, context).run();
            blocks = constantPropagationResult.blocks;
        }
        return { blocks };
    }
}

export { Pipeline };
//# sourceMappingURL=Pipeline.js.map
