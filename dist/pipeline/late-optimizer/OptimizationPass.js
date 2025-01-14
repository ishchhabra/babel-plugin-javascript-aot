class BaseOptimizationPass {
    moduleUnit;
    constructor(moduleUnit) {
        this.moduleUnit = moduleUnit;
    }
    run() {
        let continueOptimizing = true;
        while (continueOptimizing) {
            const result = this.step();
            if (!result.changed) {
                continueOptimizing = false;
            }
        }
        return { blocks: this.moduleUnit.blocks };
    }
}

export { BaseOptimizationPass };
//# sourceMappingURL=OptimizationPass.js.map
