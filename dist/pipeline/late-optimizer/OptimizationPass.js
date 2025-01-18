class BaseOptimizationPass {
    functionIR;
    constructor(functionIR) {
        this.functionIR = functionIR;
    }
    run() {
        let continueOptimizing = true;
        while (continueOptimizing) {
            const result = this.step();
            if (!result.changed) {
                continueOptimizing = false;
            }
        }
        return { blocks: this.functionIR.blocks };
    }
}

export { BaseOptimizationPass };
//# sourceMappingURL=OptimizationPass.js.map
