class BaseOptimizationPass {
    environment;
    blocks;
    postOrder;
    constructor(environment, blocks, postOrder) {
        this.environment = environment;
        this.blocks = blocks;
        this.postOrder = postOrder;
    }
    run() {
        let continueOptimizing = true;
        while (continueOptimizing) {
            const result = this.step();
            if (!result.changed) {
                continueOptimizing = false;
            }
        }
        return { blocks: this.blocks };
    }
}

export { BaseOptimizationPass };
//# sourceMappingURL=OptimizationPass.js.map
