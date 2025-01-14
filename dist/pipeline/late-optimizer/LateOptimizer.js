import { LoadStoreForwardingPass } from './passes/LoadStoreForwardingPass.js';

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
        return { blocks };
    }
}

export { LateOptimizer };
//# sourceMappingURL=LateOptimizer.js.map
