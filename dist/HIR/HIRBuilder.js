"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HIRBuilder = void 0;
const Block_1 = require("./Block");
const Declaration_1 = require("./Declaration");
const Identifier_1 = require("./Identifier");
const Instruction_1 = require("./Instruction");
const Scope_1 = require("./Scope");
class HIRBuilder {
    #program;
    #blocks;
    #currentBlockId;
    #currentScope = null;
    #scopes = [];
    #nextBlockId = 0;
    #nextDeclarationId = 0;
    #nextIdentifierId = 0;
    #nextInstructionId = 0;
    #nextScopeId = 0;
    constructor(program) {
        this.#program = program;
        this.#blocks = new Map();
        this.#currentScope = null;
        this.#blocks.set(0, (0, Block_1.makeEmptyBlock)(this.#nextBlockId++));
        this.#currentBlockId = 0;
        this.#enterScope(); // Create initial global scope
    }
    get blocks() {
        return this.#blocks;
    }
    get phis() {
        return this.#scopes.flatMap((scope) => Array.from(scope.phis.values()));
    }
    #enterScope() {
        const newScope = new Scope_1.Scope(this.#nextScopeId++, this.#currentScope);
        this.#scopes.push(newScope);
        this.#currentScope = newScope;
    }
    #exitScope() {
        if (this.#currentScope?.parent) {
            this.#currentScope = this.#currentScope.parent;
        }
    }
    get #currentBlock() {
        return this.#blocks.get(this.#currentBlockId);
    }
    build() {
        const body = this.#program.get("body");
        for (const statement of body) {
            this.#buildStatement(statement);
        }
        return this;
    }
    #buildStatement(statement) {
        const statementNode = statement.node;
        switch (statementNode.type) {
            case "BlockStatement": {
                statement.assertBlockStatement();
                this.#enterScope();
                for (const stmt of statement.get("body")) {
                    this.#buildStatement(stmt);
                }
                this.#exitScope();
                break;
            }
            case "IfStatement": {
                statement.assertIfStatement();
                const test = statement.get("test");
                const testPlace = this.#buildExpression(test);
                const consequentBlockId = this.#nextBlockId++;
                const alternateBlockId = this.#nextBlockId++;
                const fallthroughBlockId = this.#nextBlockId++;
                const branchId = (0, Instruction_1.makeInstructionId)(this.#nextInstructionId++);
                this.#currentBlock.terminal = {
                    kind: "branch",
                    test: testPlace,
                    consequent: consequentBlockId,
                    alternate: alternateBlockId,
                    fallthrough: fallthroughBlockId,
                    id: branchId,
                };
                // Process consequent
                this.#blocks.set(consequentBlockId, (0, Block_1.makeEmptyBlock)(consequentBlockId));
                this.#currentBlockId = consequentBlockId;
                this.#buildStatement(statement.get("consequent"));
                // Process alternate
                this.#blocks.set(alternateBlockId, (0, Block_1.makeEmptyBlock)(alternateBlockId));
                if (statement.node.alternate) {
                    this.#currentBlockId = alternateBlockId;
                    this.#buildStatement(statement.get("alternate"));
                }
                for (const [declarationId, phi] of this.#currentScope?.phis ?? []) {
                    this.#currentScope?.setBinding(declarationId, phi.place);
                }
                // Create fallthrough block
                this.#blocks.set(fallthroughBlockId, (0, Block_1.makeEmptyBlock)(fallthroughBlockId));
                this.#currentBlockId = fallthroughBlockId;
                break;
            }
            case "VariableDeclaration": {
                statement.assertVariableDeclaration();
                for (const declaration of statement.get("declarations")) {
                    const init = declaration.get("init");
                    if (init.hasNode()) {
                        const valuePlace = this.#buildExpression(init);
                        const targetPlace = this.#createTemporaryPlace();
                        const name = declaration.node.id.name;
                        this.#currentBlock.instructions.push({
                            id: (0, Instruction_1.makeInstructionId)(this.#nextInstructionId++),
                            kind: "StoreLocal",
                            target: targetPlace,
                            value: {
                                kind: "Load",
                                place: valuePlace,
                            },
                            type: statementNode.kind === "const" ? "const" : "let",
                        });
                        if (!this.#currentScope) {
                            throw new Error("No current scope");
                        }
                        declaration.scope.rename(name, targetPlace.identifier.name);
                        const declarationId = (0, Declaration_1.makeDeclarationId)(this.#nextDeclarationId++);
                        this.#currentScope.setDeclarationId(
                        // Using targetPlace.identifier.name because we're renaming the variable.
                        targetPlace.identifier.name, declarationId);
                        this.#currentScope.setBinding(declarationId, targetPlace);
                        if (statementNode.kind === "let") {
                            const phiPlace = this.#createTemporaryPlace();
                            const phi = {
                                source: this.#currentBlockId,
                                place: phiPlace,
                                operands: new Map([[this.#currentBlockId, targetPlace]]),
                            };
                            this.#currentScope.setPhi(declarationId, phi);
                        }
                    }
                }
                break;
            }
            case "ExpressionStatement": {
                statement.assertExpressionStatement();
                const expression = statement.get("expression");
                if (expression.isAssignmentExpression()) {
                    const left = expression.get("left");
                    if (left.isIdentifier()) {
                        const name = left.node.name;
                        const declarationId = this.#currentScope?.getDeclarationId(name);
                        if (!declarationId) {
                            throw new Error(`Undefined variable: ${name}`);
                        }
                        const valuePlace = this.#buildExpression(expression.get("right"));
                        const targetPlace = this.#createTemporaryPlace();
                        this.#currentBlock.instructions.push({
                            id: (0, Instruction_1.makeInstructionId)(this.#nextInstructionId++),
                            kind: "StoreLocal",
                            target: targetPlace,
                            value: {
                                kind: "Load",
                                place: valuePlace,
                            },
                            type: "const",
                        });
                        if (!this.#currentScope) {
                            throw new Error("No current scope");
                        }
                        expression.scope.rename(name, targetPlace.identifier.name);
                        this.#currentScope.renameDeclaration(name, targetPlace.identifier.name);
                        this.#currentScope.setBinding(declarationId, targetPlace);
                        const phi = this.#currentScope.getPhi(declarationId);
                        if (phi) {
                            phi.operands.set(this.#currentBlockId, targetPlace);
                        }
                    }
                }
                break;
            }
            default: {
                const resultPlace = this.#createTemporaryPlace();
                this.#currentBlock.instructions.push({
                    id: (0, Instruction_1.makeInstructionId)(this.#nextInstructionId++),
                    kind: "UnsupportedNode",
                    target: resultPlace,
                    node: statementNode,
                    type: "const",
                });
                statement.skip();
            }
        }
    }
    #buildExpression(expression) {
        const expressionNode = expression.node;
        switch (expressionNode.type) {
            case "Identifier": {
                const name = expressionNode.name;
                if (!this.#currentScope) {
                    throw new Error("No current scope");
                }
                const declarationId = this.#currentScope.getDeclarationId(name);
                if (!declarationId) {
                    throw new Error(`Undefined variable: ${name}`);
                }
                const place = this.#currentScope.getBinding(declarationId);
                if (!place) {
                    throw new Error(`Undefined variable: ${name}`);
                }
                return place;
            }
            case "NumericLiteral":
            case "StringLiteral":
            case "BooleanLiteral": {
                const resultPlace = this.#createTemporaryPlace();
                this.#currentBlock.instructions.push({
                    id: (0, Instruction_1.makeInstructionId)(this.#nextInstructionId++),
                    kind: "StoreLocal",
                    target: resultPlace,
                    value: {
                        kind: "Primitive",
                        value: expressionNode.value,
                    },
                    type: "const",
                });
                return resultPlace;
            }
            case "BinaryExpression": {
                const leftPlace = this.#buildExpression(expression.get("left"));
                const rightPlace = this.#buildExpression(expression.get("right"));
                const resultPlace = this.#createTemporaryPlace();
                this.#currentBlock.instructions.push({
                    id: (0, Instruction_1.makeInstructionId)(this.#nextInstructionId++),
                    kind: "BinaryExpression",
                    target: resultPlace,
                    operator: expressionNode.operator,
                    left: leftPlace,
                    right: rightPlace,
                    type: "const",
                });
                return resultPlace;
            }
            case "UnaryExpression": {
                expression.assertUnaryExpression();
                const operandPlace = this.#buildExpression(expression.get("argument"));
                const resultPlace = this.#createTemporaryPlace();
                this.#currentBlock.instructions.push({
                    id: (0, Instruction_1.makeInstructionId)(this.#nextInstructionId++),
                    kind: "UnaryExpression",
                    target: resultPlace,
                    operator: expressionNode.operator,
                    value: operandPlace,
                    type: "const",
                });
                return resultPlace;
            }
            case "UpdateExpression": {
                expression.assertUpdateExpression();
                const argumentPlace = this.#buildExpression(expression.get("argument"));
                const resultPlace = this.#createTemporaryPlace();
                this.#currentBlock.instructions.push({
                    id: (0, Instruction_1.makeInstructionId)(this.#nextInstructionId++),
                    kind: "UpdateExpression",
                    target: resultPlace,
                    operator: expressionNode.operator,
                    prefix: expressionNode.prefix,
                    value: argumentPlace,
                    type: "const",
                });
                return resultPlace;
            }
            default: {
                const resultPlace = this.#createTemporaryPlace();
                this.#currentBlock.instructions.push({
                    id: (0, Instruction_1.makeInstructionId)(this.#nextInstructionId++),
                    kind: "UnsupportedNode",
                    target: resultPlace,
                    node: expressionNode,
                    type: "const",
                });
                return resultPlace;
            }
        }
    }
    #createTemporaryPlace() {
        const identifierId = (0, Identifier_1.makeIdentifierId)(this.#nextIdentifierId++);
        return {
            kind: "Identifier",
            identifier: {
                id: identifierId,
                declarationId: (0, Declaration_1.makeDeclarationId)(this.#nextDeclarationId++),
                name: (0, Identifier_1.makeIdentifierName)(identifierId),
            },
        };
    }
}
exports.HIRBuilder = HIRBuilder;
