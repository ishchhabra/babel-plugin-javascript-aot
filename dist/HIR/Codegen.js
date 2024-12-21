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
const Block_1 = require("./Block");
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
        const block = this.#blocks.get(blockId);
        if (block === undefined || this.#generatedBlocks.has(blockId)) {
            return;
        }
        this.#generatedBlocks.add(blockId);
        if (block instanceof Block_1.BasicBlock) {
            return this.#generateBasicBlock(block, body);
        }
        if (block instanceof Block_1.ForLoopBlock) {
            return this.#generateForLoopBlock(block, body);
        }
    }
    #generateBasicBlock(block, body) {
        this.#generatedBlocks.add(block.id);
        this.generatePhiAssignments(block.id, body);
        for (const instruction of block.instructions) {
            const instructionNode = this.#generateInstruction(instruction);
            body.push(instructionNode);
            if (instruction.kind === "StoreLocal") {
                for (const phi of this.#phis.values()) {
                    const phiOperand = phi.operands.get(block.id);
                    if (phiOperand?.identifier.id === instruction.target.identifier.id) {
                        body.push(t.expressionStatement(t.assignmentExpression("=", t.identifier(phi.place.identifier.name), t.identifier(instruction.target.identifier.name))));
                    }
                }
            }
        }
        if (block.terminal !== null) {
            this.#generateTerminal(block.terminal, body);
        }
    }
    #generateForLoopBlock(block, body) {
        const bodyBlock = block.body;
        const bodyStatements = [];
        this.#generateBlock(bodyBlock.id, bodyStatements);
        const forLoop = t.forStatement(block.init.node, block.test.node, block.update.node, t.blockStatement(bodyStatements));
        if (bodyBlock.terminal) {
            this.#generateTerminal(bodyBlock.terminal, bodyStatements);
        }
        body.push(forLoop);
    }
    #generateInstruction(instruction) {
        switch (instruction.kind) {
            case "StoreLocal": {
                const value = this.#generateValue(instruction.value);
                return t.variableDeclaration(instruction.type, [
                    t.variableDeclarator(t.identifier(instruction.target.identifier.name), value),
                ]);
            }
            case "CallExpression":
            case "UnaryExpression":
            case "BinaryExpression":
            case "UpdateExpression":
            case "ArrayExpression": {
                return t.variableDeclaration("const", [
                    t.variableDeclarator(t.identifier(instruction.target.identifier.name), this.#generateExpression(instruction)),
                ]);
            }
            case "FunctionDeclaration": {
                const params = instruction.params.map((param) => t.identifier(param.identifier.name));
                const functionBody = [];
                this.#generateBlock(instruction.body, functionBody);
                return t.functionDeclaration(t.identifier(instruction.target.identifier.name), params, t.blockStatement(functionBody));
            }
            case "UnsupportedNode": {
                if (!t.isStatement(instruction.node)) {
                    return t.variableDeclaration("const", [
                        t.variableDeclarator(t.identifier(instruction.target.identifier.name), instruction.node),
                    ]);
                }
                return instruction.node;
            }
        }
    }
    #generateExpression(instruction) {
        switch (instruction.kind) {
            case "CallExpression": {
                const callee = this.#generatePlace(instruction.callee);
                const args = instruction.args.map((arg) => {
                    if (arg.kind === "SpreadElement") {
                        return t.spreadElement(this.#generatePlace(arg.place));
                    }
                    return this.#generatePlace(arg);
                });
                return t.callExpression(callee, args);
            }
            case "UnaryExpression": {
                return t.unaryExpression(instruction.operator, t.identifier(instruction.value.identifier.name));
            }
            case "BinaryExpression": {
                return t.binaryExpression(instruction.operator, t.identifier(instruction.left.identifier.name), t.identifier(instruction.right.identifier.name));
            }
            case "UpdateExpression": {
                return t.updateExpression(instruction.operator, t.identifier(instruction.value.identifier.name), instruction.prefix);
            }
            case "ArrayExpression": {
                return t.arrayExpression(instruction.elements.map((element) => {
                    if (element.kind === "SpreadElement") {
                        return t.spreadElement(this.#generatePlace(element.place));
                    }
                    return this.#generatePlace(element);
                }));
            }
        }
    }
    #generatePlace(place) {
        switch (place.kind) {
            case "Identifier":
                return t.identifier(place.identifier.name);
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
            case "jump": {
                this.#generateBlock(terminal.target, body);
                this.#generateBlock(terminal.fallthrough, body);
                break;
            }
            case "return": {
                body.push(t.returnStatement(t.identifier(terminal.value.identifier.name)));
                break;
            }
        }
    }
}
exports.Codegen = Codegen;
