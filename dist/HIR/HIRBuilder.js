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
exports.HIRBuilder = void 0;
const t = __importStar(require("@babel/types"));
const utils_1 = require("../Babel/utils");
const Block_1 = require("./Block");
const Declaration_1 = require("./Declaration");
const Identifier_1 = require("./Identifier");
const Instruction_1 = require("./Instruction");
const Place_1 = require("./Place");
const Scope_1 = require("./Scope");
class HIRBuilder {
    #blocks = new Map();
    #program;
    #scopes = [];
    #currentBlock;
    #currentScope;
    // ID generators
    #nextBlockId = 0;
    #nextDeclarationId = 0;
    #nextIdentifierId = 0;
    #nextInstructionId = 0;
    #nextScopeId = 0;
    constructor(program) {
        this.#program = program;
        this.#enterGlobalScope(program);
        const entryBlock = Block_1.BasicBlock.empty(this.#nextBlockId++, undefined);
        this.#blocks.set(entryBlock.id, entryBlock);
        this.#currentBlock = entryBlock;
    }
    // Public API
    build() {
        const body = this.#program.get("body");
        for (const statement of body) {
            this.#buildStatement(statement);
        }
        return this;
    }
    get blocks() {
        return this.#blocks;
    }
    get phis() {
        return this.#scopes.flatMap((scope) => Array.from(scope.phis.values()));
    }
    // Scope Management
    #enterGlobalScope(path) {
        const newScope = new Scope_1.GlobalScope(this.#nextScopeId++);
        this.#scopes.push(newScope);
        this.#currentScope = newScope;
        this.#buildBindings(path);
    }
    #enterFunctionScope(path) {
        const newScope = new Scope_1.FunctionScope(this.#nextScopeId++, this.#currentScope);
        this.#scopes.push(newScope);
        this.#currentScope = newScope;
        this.#buildBindings(path);
    }
    #enterBlockScope(path) {
        const newScope = new Scope_1.BlockScope(this.#nextScopeId++, this.#currentScope);
        this.#scopes.push(newScope);
        this.#currentScope = newScope;
        this.#buildBindings(path);
    }
    #exitScope() {
        if (this.#currentScope?.parent) {
            this.#currentScope = this.#currentScope.parent;
        }
    }
    #buildBindings(bindingPath) {
        if (!this.#currentScope) {
            throw new Error("No current scope");
        }
        bindingPath.traverse({
            Declaration: (path) => {
                switch (path.node.type) {
                    case "FunctionDeclaration":
                        path.assertFunctionDeclaration();
                        if (path.parentPath !== bindingPath) {
                            return;
                        }
                        const functionName = (0, utils_1.getFunctionName)(path);
                        if (!functionName) {
                            return;
                        }
                        const declarationId = (0, Declaration_1.makeDeclarationId)(this.#nextDeclarationId++);
                        const place = this.#createTemporaryPlace();
                        path.scope.rename(functionName.node.name, place.identifier.name);
                        this.#currentScope?.setDeclarationId(place.identifier.name, declarationId);
                        this.#currentScope?.setBinding(declarationId, place);
                        break;
                    case "VariableDeclaration":
                        path.assertVariableDeclaration();
                        if (path.parentPath !== bindingPath &&
                            !(bindingPath.isFunctionDeclaration() && path.node.kind === "var")) {
                            return;
                        }
                        for (const declaration of path.node.declarations) {
                            if (t.isIdentifier(declaration.id)) {
                                const declarationId = (0, Declaration_1.makeDeclarationId)(this.#nextDeclarationId++);
                                const place = this.#createTemporaryPlace();
                                path.scope.rename(declaration.id.name, place.identifier.name);
                                this.#currentScope?.setDeclarationId(place.identifier.name, declarationId);
                                this.#currentScope?.setBinding(declarationId, place);
                            }
                        }
                        break;
                }
            },
        });
    }
    // Statement Building
    #buildStatement(statement) {
        const statementNode = statement.node;
        switch (statementNode.type) {
            case "ReturnStatement":
                statement.assertReturnStatement();
                this.#buildReturnStatement(statement);
                break;
            case "BlockStatement":
                statement.assertBlockStatement();
                this.#buildBlockStatement(statement);
                break;
            case "IfStatement":
                statement.assertIfStatement();
                this.#buildIfStatement(statement);
                break;
            case "FunctionDeclaration":
                statement.assertFunctionDeclaration();
                this.#buildFunctionDeclaration(statement);
                break;
            case "VariableDeclaration":
                statement.assertVariableDeclaration();
                this.#buildVariableDeclaration(statement);
                break;
            case "ExpressionStatement":
                statement.assertExpressionStatement();
                this.#buildExpressionStatement(statement);
                break;
            case "ForStatement":
                statement.assertForStatement();
                this.#buildForStatement(statement);
                break;
            default:
                this.#buildUnsupportedStatement(statement);
        }
    }
    #buildForStatement(statement) {
        this.#enterBlockScope(statement);
        const bodyBlock = Block_1.BasicBlock.empty(this.#nextBlockId++, this.#currentBlock.id);
        const exitBlock = Block_1.BasicBlock.empty(this.#nextBlockId++, this.#currentBlock.id);
        const init = statement.get("init");
        const test = statement.get("test");
        const update = statement.get("update");
        const forLoopBlock = new Block_1.ForLoopBlock(this.#nextBlockId++, init, test, bodyBlock, update, this.#currentBlock.id);
        this.#blocks.set(forLoopBlock.id, forLoopBlock);
        this.#blocks.set(bodyBlock.id, bodyBlock);
        this.#blocks.set(exitBlock.id, exitBlock);
        // Jump to the for loop block
        this.#currentBlock.setTerminal({
            kind: "jump",
            id: (0, Instruction_1.makeInstructionId)(this.#nextInstructionId++),
            target: forLoopBlock.id,
            fallthrough: exitBlock.id,
        });
        // Only build the loop body statements in the body block
        this.#currentBlock = bodyBlock;
        this.#buildStatement(statement.get("body"));
        // Continue with statements after the loop in the exit block
        this.#currentBlock = exitBlock;
        this.#exitScope();
    }
    #buildReturnStatement(statement) {
        const argument = statement.get("argument");
        if (argument.hasNode()) {
            const returnPlace = this.#buildExpression(argument);
            this.#currentBlock.setTerminal({
                kind: "return",
                id: (0, Instruction_1.makeInstructionId)(this.#nextInstructionId++),
                value: returnPlace,
            });
        }
    }
    #buildBlockStatement(statement) {
        this.#enterBlockScope(statement);
        for (const stmt of statement.get("body")) {
            this.#buildStatement(stmt);
        }
        this.#exitScope();
    }
    #buildIfStatement(statement) {
        const test = statement.get("test");
        const testPlace = this.#buildExpression(test);
        const consequentBlockId = this.#nextBlockId++;
        const alternateBlockId = this.#nextBlockId++;
        const fallthroughBlockId = this.#nextBlockId++;
        this.#currentBlock.setTerminal({
            kind: "branch",
            id: (0, Instruction_1.makeInstructionId)(this.#nextInstructionId++),
            test: testPlace,
            consequent: consequentBlockId,
            alternate: alternateBlockId,
            fallthrough: fallthroughBlockId,
        });
        // Process consequent
        const consequentBlock = Block_1.BasicBlock.empty(consequentBlockId, this.#currentBlock.id);
        this.#blocks.set(consequentBlockId, consequentBlock);
        this.#currentBlock = consequentBlock;
        this.#buildStatement(statement.get("consequent"));
        // Process alternate
        const alternateBlock = Block_1.BasicBlock.empty(alternateBlockId, this.#currentBlock.id);
        this.#blocks.set(alternateBlockId, alternateBlock);
        if (statement.node.alternate) {
            this.#currentBlock = alternateBlock;
            const alternate = statement.get("alternate");
            if (alternate.hasNode()) {
                this.#buildStatement(alternate);
            }
        }
        // Update phi nodes
        for (const [declarationId, phi] of this.#currentScope?.phis ?? []) {
            this.#currentScope?.setBinding(declarationId, phi.place);
        }
        // Create fallthrough block
        const fallthroughBlock = Block_1.BasicBlock.empty(fallthroughBlockId, this.#currentBlock.parent);
        this.#blocks.set(fallthroughBlockId, fallthroughBlock);
        this.#currentBlock = fallthroughBlock;
    }
    #buildFunctionDeclaration(statement) {
        const bodyBlockId = this.#nextBlockId++;
        this.#blocks.set(bodyBlockId, Block_1.BasicBlock.empty(bodyBlockId, this.#currentBlock.id));
        const functionName = (0, utils_1.getFunctionName)(statement);
        if (!functionName || !this.#currentScope) {
            throw new Error("Invalid function declaration");
        }
        const declarationId = this.#currentScope.getDeclarationId(functionName.node.name);
        if (declarationId === undefined) {
            throw new Error(`Undefined variable: ${functionName.node.name}`);
        }
        const functionPlace = this.#currentScope.getBinding(declarationId);
        if (!functionPlace) {
            throw new Error(`Internal error: Missing binding for ${functionName.node.name}`);
        }
        const instruction = new Instruction_1.FunctionDeclarationInstruction((0, Instruction_1.makeInstructionId)(this.#nextInstructionId++), functionPlace, [], // Parameters filled later
        bodyBlockId);
        this.#currentBlock.addInstruction(instruction);
        this.#enterFunctionScope(statement);
        const params = this.#buildFunctionParameters(statement);
        instruction.params = params;
        const previousBlock = this.#currentBlock;
        this.#currentBlock = this.#blocks.get(bodyBlockId);
        this.#buildStatement(statement.get("body"));
        this.#currentBlock = previousBlock;
        this.#exitScope();
    }
    #buildFunctionParameters(statement) {
        const params = statement.get("params");
        const body = statement.get("body");
        return params.map((param) => {
            if (!param.isIdentifier()) {
                throw new Error("Only identifier parameters are supported");
            }
            const paramPlace = this.#createTemporaryPlace();
            const name = param.node.name;
            body.scope.rename(name, paramPlace.identifier.name);
            const declarationId = (0, Declaration_1.makeDeclarationId)(this.#nextDeclarationId++);
            this.#currentScope?.setDeclarationId(paramPlace.identifier.name, declarationId);
            this.#currentScope?.setBinding(declarationId, paramPlace);
            return paramPlace;
        });
    }
    #buildVariableDeclaration(statement) {
        statement.assertVariableDeclaration();
        for (const declaration of statement.get("declarations")) {
            const init = declaration.get("init");
            if (init.hasNode()) {
                const valuePlace = this.#buildExpression(init);
                const name = declaration.node.id.name;
                if (!this.#currentScope) {
                    throw new Error("No current scope");
                }
                const declarationId = this.#currentScope.getDeclarationId(name);
                if (declarationId === undefined) {
                    throw new Error(`Undefined variable: ${name}`);
                }
                const targetPlace = this.#currentScope.getBinding(declarationId);
                if (targetPlace === undefined) {
                    throw new Error(`Undefined variable: ${name}`);
                }
                this.#currentBlock.addInstruction(new Instruction_1.StoreLocalInstruction((0, Instruction_1.makeInstructionId)(this.#nextInstructionId++), targetPlace, {
                    kind: "Load",
                    place: valuePlace,
                }, statement.node.kind === "const" ? "const" : "let"));
                if (statement.node.kind === "let") {
                    const phiPlace = this.#createTemporaryPlace();
                    const phi = {
                        source: this.#currentBlock.id,
                        place: phiPlace,
                        operands: new Map([[this.#currentBlock.id, targetPlace]]),
                    };
                    this.#currentScope.setPhi(declarationId, phi);
                }
            }
        }
    }
    #buildExpressionStatement(statement) {
        const expression = statement.get("expression");
        if (expression.isAssignmentExpression()) {
            const left = expression.get("left");
            if (left.isIdentifier()) {
                const name = left.node.name;
                const declarationId = this.#currentScope?.getDeclarationId(name);
                if (declarationId === undefined) {
                    throw new Error(`Undefined variable: ${name}`);
                }
                const valuePlace = this.#buildExpression(expression.get("right"));
                const targetPlace = this.#createTemporaryPlace();
                this.#currentBlock.addInstruction(new Instruction_1.StoreLocalInstruction((0, Instruction_1.makeInstructionId)(this.#nextInstructionId++), targetPlace, {
                    kind: "Load",
                    place: valuePlace,
                }, "const"));
                if (!this.#currentScope) {
                    throw new Error("No current scope");
                }
                expression.scope.rename(name, targetPlace.identifier.name);
                this.#currentScope.renameDeclaration(name, targetPlace.identifier.name);
                this.#currentScope.setBinding(declarationId, targetPlace);
                const phi = this.#currentScope.getPhi(declarationId);
                if (phi) {
                    phi.operands.set(this.#currentBlock.id, targetPlace);
                }
            }
        }
        else {
            this.#buildUnsupportedStatement(statement);
        }
    }
    #buildUnsupportedStatement(statement) {
        const resultPlace = this.#createTemporaryPlace();
        this.#currentBlock.addInstruction(new Instruction_1.UnsupportedNodeInstruction((0, Instruction_1.makeInstructionId)(this.#nextInstructionId++), resultPlace, statement.node));
    }
    // Expression Building
    #buildExpression(expression) {
        const expressionNode = expression.node;
        switch (expressionNode.type) {
            case "CallExpression":
                return this.#buildCallExpression(expression);
            case "Identifier":
                return this.#buildIdentifier(expression);
            case "ArrayExpression":
                return this.#buildArrayExpression(expression);
            case "BinaryExpression":
                return this.#buildBinaryExpression(expression);
            case "UnaryExpression":
                return this.#buildUnaryExpression(expression);
            case "UpdateExpression":
                return this.#buildUpdateExpression(expression);
            case "NumericLiteral":
            case "StringLiteral":
            case "BooleanLiteral":
                return this.#buildLiteral(expression);
            default:
                return this.#buildUnsupportedExpression(expression);
        }
    }
    #buildCallExpression(expression) {
        expression.assertCallExpression();
        const callee = this.#buildExpression(expression.get("callee"));
        const args = expression.get("arguments").map((arg) => {
            if (arg.isSpreadElement()) {
                return this.#buildSpreadElement(arg);
            }
            return this.#buildExpression(arg);
        });
        const resultPlace = this.#createTemporaryPlace();
        this.#currentBlock.addInstruction(new Instruction_1.CallExpressionInstruction((0, Instruction_1.makeInstructionId)(this.#nextInstructionId++), resultPlace, callee, args));
        return resultPlace;
    }
    #buildIdentifier(expression) {
        const name = expression.node.name;
        if (!this.#currentScope) {
            throw new Error("No current scope");
        }
        const declarationId = this.#currentScope.getDeclarationId(name);
        if (declarationId === undefined) {
            throw new Error(`Undefined variable: ${name}`);
        }
        const place = this.#currentScope.getBinding(declarationId);
        if (!place) {
            throw new Error(`Undefined variable: ${name}`);
        }
        return place;
    }
    #buildArrayExpression(expression) {
        expression.assertArrayExpression();
        const resultPlace = this.#createTemporaryPlace();
        const elements = expression.get("elements");
        const elementsPlaces = elements.map((element) => {
            if (element.isSpreadElement()) {
                return this.#buildSpreadElement(element);
            }
            return this.#buildExpression(element);
        });
        this.#currentBlock.addInstruction(new Instruction_1.ArrayExpressionInstruction((0, Instruction_1.makeInstructionId)(this.#nextInstructionId++), resultPlace, elementsPlaces));
        return resultPlace;
    }
    #buildBinaryExpression(expression) {
        const leftPlace = this.#buildExpression(expression.get("left"));
        const rightPlace = this.#buildExpression(expression.get("right"));
        const resultPlace = this.#createTemporaryPlace();
        this.#currentBlock.addInstruction(new Instruction_1.BinaryExpressionInstruction((0, Instruction_1.makeInstructionId)(this.#nextInstructionId++), resultPlace, expression.node.operator, leftPlace, rightPlace));
        return resultPlace;
    }
    #buildUnaryExpression(expression) {
        expression.assertUnaryExpression();
        const operandPlace = this.#buildExpression(expression.get("argument"));
        const resultPlace = this.#createTemporaryPlace();
        this.#currentBlock.addInstruction(new Instruction_1.UnaryExpressionInstruction((0, Instruction_1.makeInstructionId)(this.#nextInstructionId++), resultPlace, expression.node.operator, operandPlace));
        return resultPlace;
    }
    #buildUpdateExpression(expression) {
        expression.assertUpdateExpression();
        const argumentPlace = this.#buildExpression(expression.get("argument"));
        const resultPlace = this.#createTemporaryPlace();
        this.#currentBlock.addInstruction(new Instruction_1.UpdateExpressionInstruction((0, Instruction_1.makeInstructionId)(this.#nextInstructionId++), resultPlace, expression.node.operator, expression.node.prefix, argumentPlace));
        return resultPlace;
    }
    #buildLiteral(expression) {
        const resultPlace = this.#createTemporaryPlace();
        this.#currentBlock.addInstruction(new Instruction_1.StoreLocalInstruction((0, Instruction_1.makeInstructionId)(this.#nextInstructionId++), resultPlace, {
            kind: "Primitive",
            value: expression.node.value,
        }, "const"));
        return resultPlace;
    }
    #buildUnsupportedExpression(expression) {
        const resultPlace = this.#createTemporaryPlace();
        this.#currentBlock.addInstruction(new Instruction_1.UnsupportedNodeInstruction((0, Instruction_1.makeInstructionId)(this.#nextInstructionId++), resultPlace, expression.node));
        return resultPlace;
    }
    #buildSpreadElement(expression) {
        const argument = expression.get("argument");
        if (!argument) {
            throw new Error("Spread element has no argument");
        }
        const place = this.#buildExpression(argument);
        return {
            kind: "SpreadElement",
            place,
        };
    }
    // Utility Methods
    #createTemporaryPlace() {
        const identifierId = (0, Identifier_1.makeIdentifierId)(this.#nextIdentifierId++);
        return new Place_1.Place({
            id: identifierId,
            declarationId: (0, Declaration_1.makeDeclarationId)(this.#nextDeclarationId++),
            name: (0, Identifier_1.makeIdentifierName)(identifierId),
        });
    }
}
exports.HIRBuilder = HIRBuilder;
