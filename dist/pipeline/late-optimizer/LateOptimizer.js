import { LoadStoreForwardingPass } from './passes/LoadStoreForwardingPass.js';
import { RedundantCopyEliminationPass } from './passes/RedundantCopyEliminationPass.js';

class LateOptimizer {
    functionIR;
    projectUnit;
    options;
    constructor(functionIR, projectUnit, options) {
        this.functionIR = functionIR;
        this.projectUnit = projectUnit;
        this.options = options;
    }
    run() {
        let blocks = this.functionIR.blocks;
        if (this.options.enableLoadStoreForwardingPass) {
            const loadStoreForwardingResult = new LoadStoreForwardingPass(this.functionIR).run();
            blocks = loadStoreForwardingResult.blocks;
        }
        if (this.options.enableRedundantCopyEliminationPass) {
            const redundantStoreEliminationResult = new RedundantCopyEliminationPass(this.functionIR).run();
            blocks = redundantStoreEliminationResult.blocks;
        }
        return { blocks };
    }
}

export { LateOptimizer };
//# sourceMappingURL=LateOptimizer.js.map
