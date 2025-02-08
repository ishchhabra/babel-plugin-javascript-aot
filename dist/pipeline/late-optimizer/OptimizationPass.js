class BaseOptimizationPass {
    functionIR;
    constructor(functionIR) {
        this.functionIR = functionIR;
    }
    run() {
        let changed = false;
        let result;
        while ((result = this.step()).changed) {
            changed ||= result.changed;
        }
        return { blocks: this.functionIR.blocks, changed };
    }
}

export { BaseOptimizationPass };
//# sourceMappingURL=OptimizationPass.js.map
