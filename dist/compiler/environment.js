class Environment {
    declToPlaces = new Map();
    nextBlockId = 0;
    nextDeclarationId = 0;
    nextIdentifierId = 0;
    nextInstructionId = 0;
    nextPlaceId = 0;
    // Using getters and setters with private properties to simulate Dart's
    // `late` keyword.
    _dominators;
    _immediateDominators;
    _dominanceFrontier;
    get dominators() {
        if (this._dominators === undefined) {
            throw new Error("Dominators accessed before initialization");
        }
        return this._dominators;
    }
    set dominators(dominators) {
        this._dominators = dominators;
    }
    get immediateDominators() {
        if (this._immediateDominators === undefined) {
            throw new Error("Immediate dominators accessed before initialization");
        }
        return this._immediateDominators;
    }
    set immediateDominators(immediateDominators) {
        this._immediateDominators = immediateDominators;
    }
    get dominanceFrontier() {
        if (this._dominanceFrontier === undefined) {
            throw new Error("Dominance frontier accessed before initialization");
        }
        return this._dominanceFrontier;
    }
    set dominanceFrontier(dominanceFrontier) {
        this._dominanceFrontier = dominanceFrontier;
    }
}

export { Environment };
//# sourceMappingURL=environment.js.map
