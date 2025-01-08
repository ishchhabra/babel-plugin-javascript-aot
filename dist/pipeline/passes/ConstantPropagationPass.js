import { LiteralInstruction, BinaryExpressionInstruction } from '../../frontend/ir/Instruction.js';

class ConstantPropagationPass {
    path;
    blocks;
    context;
    constants;
    constructor(path, blocks, context) {
        this.path = path;
        this.blocks = blocks;
        this.context = context;
        let globalConstants = this.context.get("constants");
        if (globalConstants === undefined) {
            globalConstants = new Map();
            this.context.set("constants", globalConstants);
        }
        let constants = globalConstants.get(this.path);
        if (constants === undefined) {
            constants = new Map();
            globalConstants.set(this.path, constants);
        }
        this.constants = constants;
    }
    run() {
        for (const block of this.blocks.values()) {
            this.propagateConstantsInBlock(block);
        }
        return { blocks: this.blocks };
    }
    propagateConstantsInBlock(block) {
        for (const [index, instruction] of block.instructions.entries()) {
            const result = this.evaluateInstruction(instruction);
            if (result !== undefined) {
                block.instructions[index] = result;
            }
        }
    }
    evaluateInstruction(instruction) {
        if (instruction instanceof LiteralInstruction) {
            return this.evaluateLiteralInstruction(instruction);
        }
        else if (instruction instanceof BinaryExpressionInstruction) {
            return this.evaluateBinaryExpressionInstruction(instruction);
        }
        return undefined;
    }
    evaluateLiteralInstruction(instruction) {
        this.constants.set(instruction.place.identifier.id, instruction.value);
    }
    evaluateBinaryExpressionInstruction(instruction) {
        const left = this.constants.get(instruction.left.identifier.id);
        const right = this.constants.get(instruction.right.identifier.id);
        if (left === undefined || right === undefined) {
            return undefined;
        }
        const result = left + right;
        this.constants.set(instruction.place.identifier.id, result);
        return new LiteralInstruction(instruction.id, instruction.place, instruction.nodePath, result);
    }
}

export { ConstantPropagationPass };
//# sourceMappingURL=ConstantPropagationPass.js.map
