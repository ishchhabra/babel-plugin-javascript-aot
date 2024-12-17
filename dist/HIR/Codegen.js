import * as t from "@babel/types";
export class Codegen {
    #blocks;
    #phis;
    #generatedBlocks;
    constructor(blocks, phis) {
        this.#blocks = blocks;
        this.#phis = phis;
        this.#generatedBlocks = new Set();
    }
    generate() {
        const body = [];
        this.#generateBlock(0, body);
        return t.program(body);
    }
    generatePhiAssignments(blockId, body) {
        const blockPhis = this.#phis
            .filter((phi) => phi.source === blockId)
            .map((phi) => t.variableDeclaration("let", [
            t.variableDeclarator(t.identifier(phi.place.identifier.name)),
        ]));
        body.push(...blockPhis);
    }
    #generateBlock(blockId, body) {
        if (this.#generatedBlocks.has(blockId)) {
            return;
        }
        const block = this.#blocks.get(blockId);
        if (!block) {
            throw new Error(`Block ${blockId} not found`);
        }
        this.#generatedBlocks.add(blockId);
        this.generatePhiAssignments(blockId, body);
        for (const instruction of block.instructions) {
            const instructionNode = this.#generateInstruction(instruction);
            body.push(instructionNode);
            if (instruction.kind === "StoreLocal") {
                for (const phi of this.#phis.values()) {
                    const phiOperand = phi.operands.get(blockId);
                    if (phiOperand?.identifier.id === instruction.target.identifier.id) {
                        body.push(t.expressionStatement(t.assignmentExpression("=", t.identifier(phi.place.identifier.name), t.identifier(instruction.target.identifier.name))));
                    }
                }
            }
        }
        this.#generateTerminal(block.terminal, body);
    }
    #generateInstruction(instruction) {
        switch (instruction.kind) {
            case "StoreLocal": {
                const value = this.#generateValue(instruction.value);
                return t.variableDeclaration(instruction.type, [
                    t.variableDeclarator(t.identifier(instruction.target.identifier.name), value),
                ]);
            }
            case "UnaryExpression": {
                return t.variableDeclaration("const", [
                    t.variableDeclarator(t.identifier(instruction.target.identifier.name), t.unaryExpression(instruction.operator, t.identifier(instruction.value.identifier.name))),
                ]);
            }
            case "BinaryExpression": {
                return t.variableDeclaration("const", [
                    t.variableDeclarator(t.identifier(instruction.target.identifier.name), t.binaryExpression(instruction.operator, t.identifier(instruction.left.identifier.name), t.identifier(instruction.right.identifier.name))),
                ]);
            }
            case "UpdateExpression": {
                return t.variableDeclaration("const", [
                    t.variableDeclarator(t.identifier(instruction.target.identifier.name), t.updateExpression(instruction.operator, t.identifier(instruction.value.identifier.name), instruction.prefix)),
                ]);
            }
            case "UnsupportedNode": {
                return instruction.node;
            }
        }
    }
    #generateValue(value) {
        switch (value.kind) {
            case "Primitive":
                return t.valueToNode(value.value);
            case "Load":
                return t.identifier(value.place.identifier.name);
        }
    }
    #generateTerminal(terminal, body) {
        switch (terminal.kind) {
            case "branch": {
                const test = t.identifier(terminal.test.identifier.name);
                const consequent = [];
                const alternate = [];
                this.#generateBlock(terminal.consequent, consequent);
                this.#generateBlock(terminal.alternate, alternate);
                body.push(t.ifStatement(test, t.blockStatement(consequent), alternate.length > 0 ? t.blockStatement(alternate) : null));
                this.#generateBlock(terminal.fallthrough, body);
                break;
            }
            case "return": {
                body.push(t.returnStatement(t.identifier(terminal.value.identifier.name)));
                break;
            }
            case "unsupported":
                break;
        }
    }
}
