class BaseTerminal {
    id;
    constructor(id) {
        this.id = id;
    }
}
class BranchTerminal extends BaseTerminal {
    test;
    consequent;
    alternate;
    fallthrough;
    constructor(id, test, consequent, alternate, 
    /*
     * Ideally, the fallthrough block should be computed based on the
     * CFG. Currently, to simplify the implementation, we're just manually
     * including it during the IR construction. This makes the IR construction
     * more error-prone, but easier to implement.
     */
    fallthrough) {
        super(id);
        this.test = test;
        this.consequent = consequent;
        this.alternate = alternate;
        this.fallthrough = fallthrough;
    }
    getReadPlaces() {
        return [this.test];
    }
}
class JumpTerminal extends BaseTerminal {
    target;
    constructor(id, target) {
        super(id);
        this.target = target;
    }
    getReadPlaces() {
        return [];
    }
}
class ReturnTerminal extends BaseTerminal {
    value;
    constructor(id, value) {
        super(id);
        this.value = value;
    }
    getReadPlaces() {
        return [this.value];
    }
}

export { BaseTerminal, BranchTerminal, JumpTerminal, ReturnTerminal };
//# sourceMappingURL=Terminal.js.map
