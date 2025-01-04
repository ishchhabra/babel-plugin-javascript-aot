import { LateDeadCodeEliminationPass } from './passes/LateDeadCodeEliminationPass.js';
import { LoadStoreForwardingPass } from './passes/LoadStoreForwardingPass.js';

class LateOptimizer {
    options;
    environment;
    blocks;
    postOrder;
    constructor(options, environment, blocks, postOrder) {
        this.options = options;
        this.environment = environment;
        this.blocks = blocks;
        this.postOrder = postOrder;
    }
    optimize() {
        let blocks = this.blocks;
        if (this.options.enableLoadStoreForwardingPass) {
            const loadStoreForwardingResult = new LoadStoreForwardingPass(this.environment, this.blocks, this.postOrder).run();
            blocks = loadStoreForwardingResult.blocks;
        }
        if (this.options.enableLateDeadCodeEliminationPass) {
            const lateDeadCodeEliminationResult = new LateDeadCodeEliminationPass(this.environment, blocks, this.postOrder).run();
            blocks = lateDeadCodeEliminationResult.blocks;
        }
        return { blocks };
    }
}

export { LateOptimizer };
//# sourceMappingURL=LateOptimizer.js.map
