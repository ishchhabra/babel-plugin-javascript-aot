import { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { getFunctionName } from '../babel-utils.js';
import { makeInstructionId, StatementInstruction, ExpressionStatementInstruction, FunctionDeclarationInstruction, StoreLocalInstruction, UnsupportedNodeInstruction, ArrayExpressionInstruction, BinaryExpressionInstruction, CallExpressionInstruction, LoadGlobalInstruction, LoadLocalInstruction, MemberExpressionInstruction, UnaryExpressionInstruction, LiteralInstruction, ArrayPatternInstruction, HoleInstruction, SpreadElementInstruction } from '../ir/Instruction.js';
import { JumpTerminal, BranchTerminal, ReturnTerminal } from '../ir/Terminal.js';
import { createBlock, createIdentifier, createPlace } from '../ir/utils.js';

/**
 * Builds the high-level intermediate representation (HIR) from the AST.
 */
class HIRBuilder {
    program;
    environment;
    currentBlock;
    blocks = new Map();
    constructor(program, environment) {
        this.program = program;
        this.environment = environment;
        const entryBlock = createBlock(environment);
        this.blocks.set(entryBlock.id, entryBlock);
        this.currentBlock = entryBlock;
    }
    build() {
        this.#buildBindings(this.program);
        const bodyPath = this.program.get("body");
        for (const statementPath of bodyPath) {
            this.#buildStatement(statementPath);
        }
        return { blocks: this.blocks };
    }
    /******************************************************************************
     * Bindings Building
     *
     * Methods for building bindings from different types of declarations
     ******************************************************************************/
    #buildBindings(bindingsPath) {
        bindingsPath.traverse({
            Declaration: (path) => {
                switch (path.node.type) {
                    case "FunctionDeclaration": {
                        path.assertFunctionDeclaration();
                        // For function declarations, we only want direct children
                        // of the binding path. The nested function declarations
                        // are not in the scope of the current path.
                        if (path.parentPath !== bindingsPath) {
                            return;
                        }
                        const functionName = getFunctionName(path);
                        if (functionName === null) {
                            return;
                        }
                        const identifier = createIdentifier(this.environment);
                        this.#registerDeclarationName(functionName.node.name, identifier.declarationId, bindingsPath);
                        // Rename the variable name in the scope to the temporary place.
                        bindingsPath.scope.rename(functionName.node.name, identifier.name);
                        this.#registerDeclarationName(identifier.name, identifier.declarationId, bindingsPath);
                        const place = createPlace(identifier, this.environment);
                        this.#registerDeclarationPlace(identifier.declarationId, place);
                        break;
                    }
                    case "VariableDeclaration": {
                        path.assertVariableDeclaration();
                        const isHoistable = bindingsPath.isFunctionDeclaration() && path.node.kind === "var";
                        if (path.parentPath !== bindingsPath && !isHoistable) {
                            return;
                        }
                        const declarationPaths = path.get("declarations");
                        for (const declarationPath of declarationPaths) {
                            const id = declarationPath.get("id");
                            this.#buildLValBindings(id, bindingsPath);
                        }
                        break;
                    }
                }
            },
        });
        // Register the parameter bindings for function declarations.
        if (bindingsPath.isFunctionDeclaration()) {
            const paramPaths = bindingsPath.get("params");
            for (const paramPath of paramPaths) {
                this.#buildParameterBindings(paramPath, bindingsPath);
            }
        }
    }
    #buildLValBindings(nodePath, bindingsPath) {
        switch (nodePath.type) {
            case "Identifier":
                nodePath.assertIdentifier();
                this.#buildIdentifierBindings(nodePath, bindingsPath);
                break;
            case "ArrayPattern":
                nodePath.assertArrayPattern();
                this.#buildArrayPatternBindings(nodePath, bindingsPath);
                break;
            case "ObjectPattern":
                nodePath.assertObjectPattern();
                this.#buildObjectPatternBindings(nodePath, bindingsPath);
                break;
            case "RestElement":
                nodePath.assertRestElement();
                this.#buildRestElementBindings(nodePath, bindingsPath);
                break;
            default:
                throw new Error(`Unsupported LVal type: ${nodePath.type}`);
        }
    }
    #buildIdentifierBindings(nodePath, bindingsPath) {
        const identifier = createIdentifier(this.environment);
        this.#registerDeclarationName(nodePath.node.name, identifier.declarationId, bindingsPath);
        // Rename the variable name in the scope to the temporary place.
        bindingsPath.scope.rename(nodePath.node.name, identifier.name);
        this.#registerDeclarationName(identifier.name, identifier.declarationId, bindingsPath);
        const place = createPlace(identifier, this.environment);
        this.#registerDeclarationPlace(identifier.declarationId, place);
    }
    #buildArrayPatternBindings(nodePath, bindingsPath) {
        const elementsPath = nodePath.get("elements");
        for (const elementPath of elementsPath) {
            elementPath.assertLVal();
            this.#buildLValBindings(elementPath, bindingsPath);
        }
    }
    #buildObjectPatternBindings(nodePath, bindingsPath) {
        const propertiesPath = nodePath.get("properties");
        for (const propertyPath of propertiesPath) {
            if (!propertyPath.isLVal()) {
                throw new Error(`Unsupported property type: ${propertyPath.type}`);
            }
            this.#buildLValBindings(propertyPath, bindingsPath);
        }
    }
    #buildRestElementBindings(nodePath, bindingsPath) {
        const elementPath = nodePath.get("argument");
        this.#buildLValBindings(elementPath, bindingsPath);
    }
    #buildParameterBindings(nodePath, bindingsPath) {
        switch (nodePath.type) {
            case "Identifier":
                nodePath.assertIdentifier();
                this.#buildIdentifierBindings(nodePath, bindingsPath);
                break;
            case "RestElement":
                nodePath.assertRestElement();
                this.#buildRestElementBindings(nodePath, bindingsPath);
                break;
            default:
                throw new Error(`Unsupported parameter type: ${nodePath.type}`);
        }
    }
    /******************************************************************************
     * Statement Building
     *
     * Methods for building HIR from different types of statement nodes
     ******************************************************************************/
    #buildStatement(statementPath) {
        switch (statementPath.type) {
            case "BlockStatement":
                statementPath.assertBlockStatement();
                this.#buildBlockStatement(statementPath);
                break;
            case "ExpressionStatement":
                statementPath.assertExpressionStatement();
                this.#buildExpressionStatement(statementPath);
                break;
            case "FunctionDeclaration":
                statementPath.assertFunctionDeclaration();
                this.#buildFunctionDeclaration(statementPath);
                break;
            case "IfStatement":
                statementPath.assertIfStatement();
                this.#buildIfStatement(statementPath);
                break;
            case "ReturnStatement":
                statementPath.assertReturnStatement();
                this.#buildReturnStatement(statementPath);
                break;
            case "VariableDeclaration":
                statementPath.assertVariableDeclaration();
                this.#buildVariableDeclaration(statementPath);
                break;
            case "WhileStatement":
                statementPath.assertWhileStatement();
                this.#buildWhileStatement(statementPath);
                break;
            default:
                this.#buildUnsupportedStatement(statementPath);
                break;
        }
    }
    #buildBlockStatement(statementPath) {
        const currentBlock = this.currentBlock;
        const block = createBlock(this.environment);
        this.blocks.set(block.id, block);
        this.currentBlock = block;
        this.#buildBindings(statementPath);
        const body = statementPath.get("body");
        for (const statementPath of body) {
            this.#buildStatement(statementPath);
        }
        currentBlock.terminal = new JumpTerminal(makeInstructionId(this.environment.nextInstructionId++), block.id);
    }
    #buildExpressionStatement(statementPath) {
        const expressionPath = statementPath.get("expression");
        const expressionPlace = this.#buildExpression(expressionPath);
        // For assignments, since we convert them to a store instruction,
        // we do not need to emit an expression statement instruction.
        const expressionInstruction = this.currentBlock.instructions.at(-1);
        if (expressionInstruction instanceof StatementInstruction &&
            expressionInstruction.place === expressionPlace) {
            return;
        }
        const identifier = createIdentifier(this.environment);
        const place = createPlace(identifier, this.environment);
        const instructionId = makeInstructionId(this.environment.nextInstructionId++);
        this.currentBlock.instructions.push(new ExpressionStatementInstruction(instructionId, place, expressionPath, expressionPlace));
    }
    #buildFunctionDeclaration(statementPath) {
        const currentBlock = this.currentBlock;
        this.#buildBindings(statementPath);
        // Build the body block.
        const bodyBlock = createBlock(this.environment);
        this.blocks.set(bodyBlock.id, bodyBlock);
        this.currentBlock = bodyBlock;
        const params = statementPath.get("params");
        const paramPlaces = params.map((param) => {
            if (!param.isIdentifier()) {
                throw new Error(`Unsupported parameter type: ${param.type}`);
            }
            const declarationId = this.#getDeclarationId(param.node.name, statementPath);
            if (declarationId === undefined) {
                throw new Error(`Variable accessed before declaration: ${param.node.name}`);
            }
            const place = this.#getLatestDeclarationPlace(declarationId);
            if (place === undefined) {
                throw new Error(`Unable to find the place for ${param.node.name}`);
            }
            return place;
        });
        const bodyPath = statementPath.get("body");
        this.currentBlock = bodyBlock;
        this.#buildStatement(bodyPath);
        const functionName = getFunctionName(statementPath);
        if (functionName === null) {
            throw new Error("Invalid function declaration");
        }
        const declarationId = this.#getDeclarationId(functionName.node.name, statementPath);
        if (declarationId === undefined) {
            throw new Error(`Function accessed before declaration: ${functionName.node.name}`);
        }
        const functionPlace = this.#getLatestDeclarationPlace(declarationId);
        if (functionPlace === undefined) {
            throw new Error(`Unable to find the place for ${functionName.node.name} (${declarationId})`);
        }
        this.currentBlock = currentBlock;
        const instruction = new FunctionDeclarationInstruction(makeInstructionId(this.environment.nextInstructionId++), functionPlace, statementPath, paramPlaces, bodyBlock.id, statementPath.node.generator, statementPath.node.async);
        this.currentBlock.instructions.push(instruction);
    }
    #buildIfStatement(statementPath) {
        const testPath = statementPath.get("test");
        const testPlace = this.#buildExpression(testPath);
        const currentBlock = this.currentBlock;
        // Create the join block.
        const joinBlock = createBlock(this.environment);
        this.blocks.set(joinBlock.id, joinBlock);
        // Build the consequent block
        const consequentPath = statementPath.get("consequent");
        const consequentBlock = createBlock(this.environment);
        this.blocks.set(consequentBlock.id, consequentBlock);
        this.currentBlock = consequentBlock;
        this.#buildStatement(consequentPath);
        // After building the consequent block, we need to set the terminal
        // from the last block to the join block.
        this.currentBlock.terminal = new JumpTerminal(makeInstructionId(this.environment.nextInstructionId++), joinBlock.id);
        // Build the alternate block
        const alternatePath = statementPath.get("alternate");
        let alternateBlock = currentBlock;
        if (alternatePath.hasNode()) {
            alternateBlock = createBlock(this.environment);
            this.blocks.set(alternateBlock.id, alternateBlock);
            this.currentBlock = alternateBlock;
            this.#buildStatement(alternatePath);
        }
        // After building the alternate block, we need to set the terminal
        // from the last block to the join block.
        this.currentBlock.terminal = new JumpTerminal(makeInstructionId(this.environment.nextInstructionId++), joinBlock.id);
        // Set branch terminal for the current block.
        currentBlock.terminal = new BranchTerminal(makeInstructionId(this.environment.nextInstructionId++), testPlace, consequentBlock.id, alternateBlock.id, joinBlock.id);
        this.currentBlock = joinBlock;
    }
    #buildReturnStatement(statementPath) {
        const argument = statementPath.get("argument");
        if (!argument.hasNode()) {
            return;
        }
        const valuePlace = this.#buildExpression(argument);
        this.currentBlock.terminal = new ReturnTerminal(makeInstructionId(this.environment.nextInstructionId++), valuePlace);
    }
    #buildVariableDeclaration(statementPath) {
        const declarations = statementPath.get("declarations");
        for (const declaration of declarations) {
            const id = declaration.get("id");
            const lvalPlace = this.#buildLVal(id, true);
            const init = declaration.get("init");
            if (!init.hasNode()) {
                continue;
            }
            const valuePlace = this.#buildExpression(init);
            const identifier = createIdentifier(this.environment);
            const place = createPlace(identifier, this.environment);
            const instructionId = makeInstructionId(this.environment.nextInstructionId++);
            this.currentBlock.instructions.push(new StoreLocalInstruction(instructionId, place, statementPath, lvalPlace, valuePlace, "const"));
        }
    }
    #buildWhileStatement(statementPath) {
        const currentBlock = this.currentBlock;
        // Build the test block.
        const testPath = statementPath.get("test");
        const testBlock = createBlock(this.environment);
        this.blocks.set(testBlock.id, testBlock);
        this.currentBlock = testBlock;
        const testPlace = this.#buildExpression(testPath);
        const testBlockTerminus = this.currentBlock;
        // Build the body block.
        const bodyPath = statementPath.get("body");
        const bodyBlock = createBlock(this.environment);
        this.blocks.set(bodyBlock.id, bodyBlock);
        this.currentBlock = bodyBlock;
        this.#buildStatement(bodyPath);
        const bodyBlockTerminus = this.currentBlock;
        // Build the exit block.
        const exitBlock = createBlock(this.environment);
        this.blocks.set(exitBlock.id, exitBlock);
        // Set the branch terminal for the test block.
        testBlockTerminus.terminal = new BranchTerminal(makeInstructionId(this.environment.nextInstructionId++), testPlace, bodyBlock.id, exitBlock.id, exitBlock.id);
        // Set the jump terminal for body block to create a back edge.
        bodyBlockTerminus.terminal = new JumpTerminal(makeInstructionId(this.environment.nextInstructionId++), testBlock.id);
        // Set the jump terminal for the current block.
        currentBlock.terminal = new JumpTerminal(makeInstructionId(this.environment.nextInstructionId++), testBlock.id);
        this.currentBlock = exitBlock;
    }
    #buildUnsupportedStatement(statementPath) {
        const identifier = createIdentifier(this.environment);
        const place = createPlace(identifier, this.environment);
        this.currentBlock.instructions.push(new UnsupportedNodeInstruction(makeInstructionId(this.environment.nextInstructionId++), place, statementPath, statementPath.node));
    }
    /******************************************************************************
     * Expression Building
     *
     * Methods for building HIR from different types of expression nodes
     ******************************************************************************/
    #buildExpression(expressionPath) {
        switch (expressionPath.type) {
            case "ArrayExpression":
                expressionPath.assertArrayExpression();
                return this.#buildArrayExpression(expressionPath);
            case "AssignmentExpression":
                expressionPath.assertAssignmentExpression();
                return this.#buildAssignmentExpression(expressionPath);
            case "BinaryExpression":
                expressionPath.assertBinaryExpression();
                return this.#buildBinaryExpression(expressionPath);
            case "CallExpression":
                expressionPath.assertCallExpression();
                return this.#buildCallExpression(expressionPath);
            case "Identifier":
                expressionPath.assertIdentifier();
                return this.#buildIdentifier(expressionPath);
            case "MemberExpression":
                expressionPath.assertMemberExpression();
                return this.#buildMemberExpression(expressionPath);
            case "UpdateExpression":
                expressionPath.assertUpdateExpression();
                return this.#buildUpdateExpression(expressionPath);
            case "UnaryExpression":
                expressionPath.assertUnaryExpression();
                return this.#buildUnaryExpression(expressionPath);
            case "BooleanLiteral":
            case "NumericLiteral":
            case "StringLiteral":
                expressionPath.assertLiteral();
                return this.#buildLiteral(expressionPath);
            default:
                return this.#buildUnsupportedExpression(expressionPath);
        }
    }
    #buildArrayExpression(expressionPath) {
        const elementsPath = expressionPath.get("elements");
        const elementPlaces = elementsPath.map((elementPath) => {
            if (elementPath.node === null) {
                return this.#buildHole(elementPath);
            }
            if (elementPath.isSpreadElement()) {
                return this.#buildSpreadElement(elementPath);
            }
            elementPath.assertExpression();
            return this.#buildExpression(elementPath);
        });
        const identifier = createIdentifier(this.environment);
        const place = createPlace(identifier, this.environment);
        const instructionId = makeInstructionId(this.environment.nextInstructionId++);
        this.currentBlock.instructions.push(new ArrayExpressionInstruction(instructionId, place, expressionPath, elementPlaces));
        return place;
    }
    #buildAssignmentExpression(expressionPath) {
        const leftPath = expressionPath.get("left");
        if (!leftPath.isIdentifier()) {
            throw new Error(`Unsupported left expression type: ${leftPath.type}`);
        }
        const declarationId = this.#getDeclarationId(leftPath.node.name, expressionPath);
        if (declarationId === undefined) {
            throw new Error(`Variable accessed before declaration: ${leftPath.node.name}`);
        }
        const lvalIdentifier = createIdentifier(this.environment, declarationId);
        const lvalPlace = createPlace(lvalIdentifier, this.environment);
        const rightPath = expressionPath.get("right");
        const rightPlace = this.#buildExpression(rightPath);
        // Create a new place for this assignment using the same declarationId
        const identifier = createIdentifier(this.environment, declarationId);
        const place = createPlace(identifier, this.environment);
        this.#registerDeclarationPlace(declarationId, lvalPlace);
        const instructionId = makeInstructionId(this.environment.nextInstructionId++);
        this.currentBlock.instructions.push(new StoreLocalInstruction(instructionId, place, expressionPath, lvalPlace, rightPlace, "const"));
        return place;
    }
    #buildBinaryExpression(expressionPath) {
        const leftPath = expressionPath.get("left");
        if (!leftPath.isExpression()) {
            throw new Error(`Unsupported left expression type: ${leftPath.type}`);
        }
        const leftPlace = this.#buildExpression(leftPath);
        const rightPath = expressionPath.get("right");
        const rightPlace = this.#buildExpression(rightPath);
        const identifier = createIdentifier(this.environment);
        const place = createPlace(identifier, this.environment);
        const instructionId = makeInstructionId(this.environment.nextInstructionId++);
        this.currentBlock.instructions.push(new BinaryExpressionInstruction(instructionId, place, expressionPath, expressionPath.node.operator, leftPlace, rightPlace));
        return place;
    }
    #buildCallExpression(expressionPath) {
        const calleePath = expressionPath.get("callee");
        if (!calleePath.isExpression()) {
            throw new Error(`Unsupported callee type: ${calleePath.type}`);
        }
        const calleePlace = this.#buildExpression(calleePath);
        const argumentsPath = expressionPath.get("arguments");
        const argumentPlaces = argumentsPath.map((argumentPath) => {
            if (argumentPath.isSpreadElement()) {
                return this.#buildSpreadElement(argumentPath);
            }
            argumentPath.assertExpression();
            return this.#buildExpression(argumentPath);
        });
        const identifier = createIdentifier(this.environment);
        const place = createPlace(identifier, this.environment);
        const instructionId = makeInstructionId(this.environment.nextInstructionId++);
        this.currentBlock.instructions.push(new CallExpressionInstruction(instructionId, place, expressionPath, calleePlace, argumentPlaces));
        return place;
    }
    /**
     * Builds a place for an identifier. If the identifier is not a variable declarator,
     * a load instruction is created to load the identifier from the scope.
     */
    #buildIdentifier(expressionPath, isVariableDeclaratorId = false) {
        const name = expressionPath.node.name;
        const declarationId = this.#getDeclarationId(name, expressionPath);
        if (declarationId === undefined) {
            const identifier = createIdentifier(this.environment);
            const place = createPlace(identifier, this.environment);
            this.currentBlock.instructions.push(new LoadGlobalInstruction(makeInstructionId(this.environment.nextInstructionId++), place, expressionPath, name));
            return place;
        }
        const valuePlace = this.#getLatestDeclarationPlace(declarationId);
        if (valuePlace === undefined) {
            throw new Error(`Unable to find the place for ${name} (${declarationId})`);
        }
        // If we're building a variable declarator id, we don't need to (and can't)
        // load the value, because up until now, the value has not been declared yet.
        if (isVariableDeclaratorId) {
            return valuePlace;
        }
        const instructionId = makeInstructionId(this.environment.nextInstructionId++);
        const identifier = createIdentifier(this.environment);
        const place = createPlace(identifier, this.environment);
        this.currentBlock.instructions.push(new LoadLocalInstruction(instructionId, place, expressionPath, valuePlace));
        return place;
    }
    #buildMemberExpression(expressionPath) {
        const objectPath = expressionPath.get("object");
        const objectPlace = this.#buildExpression(objectPath);
        const propertyPath = expressionPath.get("property");
        if (!propertyPath.isIdentifier()) {
            throw new Error(`Unsupported property type: ${propertyPath.type}`);
        }
        const propertyPlace = this.#buildExpression(propertyPath);
        const identifier = createIdentifier(this.environment);
        const place = createPlace(identifier, this.environment);
        this.currentBlock.instructions.push(new MemberExpressionInstruction(makeInstructionId(this.environment.nextInstructionId++), place, expressionPath, objectPlace, propertyPlace, expressionPath.node.computed));
        return place;
    }
    #buildUpdateExpression(expressionPath) {
        const argumentPath = expressionPath.get("argument");
        if (!argumentPath.isIdentifier()) {
            throw new Error(`Unsupported argument type: ${argumentPath.type}`);
        }
        const declarationId = this.#getDeclarationId(argumentPath.node.name, expressionPath);
        if (declarationId === undefined) {
            throw new Error(`Variable accessed before declaration: ${argumentPath.node.name}`);
        }
        const originalPlace = this.#getLatestDeclarationPlace(declarationId);
        if (originalPlace === undefined) {
            throw new Error(`Unable to find the place for ${argumentPath.node.name} (${declarationId})`);
        }
        const lvalIdentifier = createIdentifier(this.environment, declarationId);
        const lvalPlace = createPlace(lvalIdentifier, this.environment);
        const rightLiteral = t.numericLiteral(1);
        const isIncrement = expressionPath.node.operator === "++";
        const binaryExpression = t.binaryExpression(isIncrement ? "+" : "-", argumentPath.node, rightLiteral);
        const binaryExpressionPath = this.#createSyntheticBinaryPath(expressionPath, binaryExpression);
        const valuePlace = this.#buildBinaryExpression(binaryExpressionPath);
        const identifier = createIdentifier(this.environment);
        const place = createPlace(identifier, this.environment);
        this.#registerDeclarationPlace(declarationId, lvalPlace);
        this.currentBlock.instructions.push(new StoreLocalInstruction(makeInstructionId(this.environment.nextInstructionId++), place, expressionPath, lvalPlace, valuePlace, "const"));
        return expressionPath.node.prefix ? valuePlace : originalPlace;
    }
    #buildUnaryExpression(expressionPath) {
        const argumentPath = expressionPath.get("argument");
        const argumentPlace = this.#buildExpression(argumentPath);
        const identifier = createIdentifier(this.environment);
        const place = createPlace(identifier, this.environment);
        const instructionId = makeInstructionId(this.environment.nextInstructionId++);
        this.currentBlock.instructions.push(new UnaryExpressionInstruction(instructionId, place, expressionPath, expressionPath.node.operator, argumentPlace));
        return place;
    }
    #buildLiteral(expressionPath) {
        if (!t.isNumericLiteral(expressionPath.node) &&
            !t.isStringLiteral(expressionPath.node) &&
            !t.isBooleanLiteral(expressionPath.node)) {
            throw new Error(`Unsupported literal type: ${expressionPath.type}`);
        }
        const identifier = createIdentifier(this.environment);
        const place = createPlace(identifier, this.environment);
        const instructionId = makeInstructionId(this.environment.nextInstructionId++);
        this.currentBlock.instructions.push(new LiteralInstruction(instructionId, place, expressionPath, expressionPath.node.value));
        return place;
    }
    #buildUnsupportedExpression(expressionPath) {
        const identifier = createIdentifier(this.environment);
        const place = createPlace(identifier, this.environment);
        this.currentBlock.instructions.push(new UnsupportedNodeInstruction(makeInstructionId(this.environment.nextInstructionId++), place, expressionPath, expressionPath.node));
        return place;
    }
    /******************************************************************************
     * Pattern Building
     *
     * Methods for building HIR from pattern nodes like array and object patterns
     ******************************************************************************/
    #buildPattern(patternPath) {
        switch (patternPath.type) {
            case "Identifier":
                patternPath.assertIdentifier();
                return this.#buildIdentifier(patternPath, true);
            case "ArrayPattern":
                patternPath.assertArrayPattern();
                return this.#buildArrayPattern(patternPath);
            case "ObjectPattern":
                patternPath.assertObjectPattern();
                return this.#buildObjectPattern(patternPath);
            default:
                return this.#buildUnsupportedPattern(patternPath);
        }
    }
    #buildArrayPattern(patternPath) {
        const elementPaths = patternPath.get("elements");
        const elementPlaces = elementPaths.map((elementPath) => {
            if (elementPath.node == null) {
                return this.#buildHole(elementPath);
            }
            else if (elementPath.isPattern()) {
                return this.#buildPattern(elementPath);
            }
            else if (elementPath.isLVal()) {
                return this.#buildLVal(elementPath);
            }
            throw new Error(`Unsupported element type: ${elementPath.type}`);
        });
        const identifier = createIdentifier(this.environment);
        const place = createPlace(identifier, this.environment);
        this.currentBlock.instructions.push(new ArrayPatternInstruction(makeInstructionId(this.environment.nextInstructionId++), place, patternPath, elementPlaces));
        return place;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    #buildObjectPattern(patternPath) {
        throw new Error("Not implemented");
    }
    #buildUnsupportedPattern(patternPath) {
        const identifier = createIdentifier(this.environment);
        const place = createPlace(identifier, this.environment);
        this.currentBlock.instructions.push(new UnsupportedNodeInstruction(makeInstructionId(this.environment.nextInstructionId++), place, patternPath, patternPath.node));
        return place;
    }
    /******************************************************************************
     * LVal Building
     *
     * Methods for building HIR from LVal nodes like identifiers, array patterns,
     * object patterns, and rest elements. LVal nodes represent the left side of
     * assignments and declarations.
     ******************************************************************************/
    #buildLVal(lvalPath, isVariableDeclaratorId = false) {
        switch (lvalPath.type) {
            case "Identifier":
                lvalPath.assertIdentifier();
                return this.#buildIdentifier(lvalPath, isVariableDeclaratorId);
            case "ArrayPattern":
                lvalPath.assertArrayPattern();
                return this.#buildArrayPattern(lvalPath);
            case "ObjectPattern":
                lvalPath.assertObjectPattern();
                return this.#buildObjectPattern(lvalPath);
            default:
                return this.#buildUnsupportedLVal(lvalPath);
        }
    }
    #buildUnsupportedLVal(lvalPath) {
        const identifier = createIdentifier(this.environment);
        const place = createPlace(identifier, this.environment);
        this.currentBlock.instructions.push(new UnsupportedNodeInstruction(makeInstructionId(this.environment.nextInstructionId++), place, lvalPath, lvalPath.node));
        return place;
    }
    /******************************************************************************
     * Misc Node Building
     *
     * Methods for building HIR from miscellaneous node types like holes and spread
     ******************************************************************************/
    #buildHole(expressionPath) {
        const identifier = createIdentifier(this.environment);
        const place = createPlace(identifier, this.environment);
        this.currentBlock.instructions.push(new HoleInstruction(makeInstructionId(this.environment.nextInstructionId++), place, expressionPath));
        return place;
    }
    #buildSpreadElement(expressionPath) {
        const argumentPath = expressionPath.get("argument");
        const argumentPlace = this.#buildExpression(argumentPath);
        const identifier = createIdentifier(this.environment);
        const place = createPlace(identifier, this.environment);
        this.currentBlock.instructions.push(new SpreadElementInstruction(makeInstructionId(this.environment.nextInstructionId++), place, expressionPath, argumentPlace));
        return place;
    }
    /******************************************************************************
     * Utils
     *
     * Utility methods used by the HIR builder
     ******************************************************************************/
    #registerDeclarationName(name, declarationId, nodePath) {
        nodePath.scope.setData(name, declarationId);
    }
    #getDeclarationId(name, nodePath) {
        return nodePath.scope.getData(name);
    }
    #registerDeclarationPlace(declarationId, place) {
        let places = this.environment.declToPlaces.get(declarationId);
        places ??= [];
        places.push({ blockId: this.currentBlock.id, place });
        this.environment.declToPlaces.set(declarationId, places);
    }
    #getLatestDeclarationPlace(declarationId) {
        const places = this.environment.declToPlaces.get(declarationId);
        return places?.at(-1)?.place;
    }
    /**
     * Creates a synthetic NodePath for a BinaryExpression by wrapping it in an ExpressionStatement.
     * This allows us to use Babel's path traversal APIs on dynamically created expressions.
     */
    #createSyntheticBinaryPath(parentPath, binExpr) {
        const containerNode = t.expressionStatement(binExpr);
        const newPath = NodePath.get({
            hub: parentPath.hub,
            parentPath,
            parent: parentPath.node,
            container: containerNode,
            key: "expression",
        });
        return newPath;
    }
}

export { HIRBuilder };
//# sourceMappingURL=HIRBuilder.js.map
