"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Codegen = void 0;
const t = __importStar(require("@babel/types"));
class Codegen {
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
exports.Codegen = Codegen;
