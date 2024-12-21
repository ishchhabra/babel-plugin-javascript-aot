"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForLoopBlock = exports.SequenceBlock = exports.BasicBlock = exports.Block = void 0;
class Block {
    id;
    instructions;
    parent;
    phis;
    terminal;
    constructor(id, instructions, parent, phis, terminal) {
        this.id = id;
        this.instructions = instructions;
        this.parent = parent;
        this.phis = phis;
        this.terminal = terminal;
    }
    addInstruction(instruction) {
        this.instructions.push(instruction);
    }
    setTerminal(terminal) {
        this.terminal = terminal;
    }
}
exports.Block = Block;
class BasicBlock extends Block {
    static empty(id, parent) {
        return new BasicBlock(id, [], parent, new Set(), null);
    }
    constructor(id, instructions, parent, phis, terminal) {
        super(id, instructions, parent, phis, terminal);
    }
}
exports.BasicBlock = BasicBlock;
class SequenceBlock extends Block {
    expressions;
    static empty(id, parent) {
        return new SequenceBlock(id, [], parent, new Set(), null);
    }
    addExpression(expression) {
        this.expressions.push(expression);
    }
    constructor(id, instructions, parent, phis, terminal) {
        super(id, instructions, parent, phis, terminal);
        this.expressions = [];
    }
}
exports.SequenceBlock = SequenceBlock;
class ForLoopBlock extends Block {
    init;
    test;
    body;
    update;
    instructions = [];
    constructor(id, init, test, body, update, parent) {
        super(id, [], parent, new Set(), null);
        this.init = init;
        this.test = test;
        this.body = body;
        this.update = update;
    }
}
exports.ForLoopBlock = ForLoopBlock;
