import { LoadStoreForwardingPass } from './passes/LoadStoreForwardingPass.js';
import { RedundantCopyEliminationPass } from './passes/RedundantCopyEliminationPass.js';

class LateOptimizer {
    moduleUnit;
    projectUnit;
    options;
    constructor(moduleUnit, projectUnit, options) {
        this.moduleUnit = moduleUnit;
        this.projectUnit = projectUnit;
        this.options = options;
    }
    run() {
        let blocks = this.moduleUnit.blocks;
        if (this.options.enableLoadStoreForwardingPass) {
            const loadStoreForwardingResult = new LoadStoreForwardingPass(this.moduleUnit).run();
            blocks = loadStoreForwardingResult.blocks;
        }
        if (this.options.enableRedundantCopyEliminationPass) {
            const redundantStoreEliminationResult = new RedundantCopyEliminationPass(this.moduleUnit).run();
            blocks = redundantStoreEliminationResult.blocks;
        }
        return { blocks };
    }
}

export { LateOptimizer };
//# sourceMappingURL=LateOptimizer.js.map
