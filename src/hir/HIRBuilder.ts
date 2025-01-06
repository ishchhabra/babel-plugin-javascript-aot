import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { getFunctionName } from "../babel-utils";
import { Environment } from "../compiler";
import {
  ArrayExpressionInstruction,
  ArrayPatternInstruction,
  BasicBlock,
  BinaryExpressionInstruction,
  BlockId,
  BranchTerminal,
  CallExpressionInstruction,
  createBlock,
  createIdentifier,
  createPlace,
  DeclarationId,
  ExpressionStatementInstruction,
  FunctionDeclarationInstruction,
  HoleInstruction,
  JumpTerminal,
  LiteralInstruction,
  LoadGlobalInstruction,
  LoadLocalInstruction,
  makeInstructionId,
  MemberExpressionInstruction,
  ObjectExpressionInstruction,
  ObjectPropertyInstruction,
  Place,
  ReturnTerminal,
  SpreadElementInstruction,
  StatementInstruction,
  StoreLocalInstruction,
  UnaryExpressionInstruction,
  UnsupportedNodeInstruction,
} from "../ir";
import {
  ExportDefaultDeclarationInstruction,
  JSXElementInstruction,
  JSXFragmentInstruction,
  JSXTextInstruction,
  LogicalExpressionInstruction,
  ObjectMethodInstruction,
} from "../ir/Instruction";

export interface HIR {
  blocks: Map<BlockId, BasicBlock>;
}

/**
 * Builds the high-level intermediate representation (HIR) from the AST.
 */
export class HIRBuilder {
  private currentBlock: BasicBlock;

  private readonly blocks: Map<BlockId, BasicBlock> = new Map();

  constructor(
    private readonly program: NodePath<t.Program>,
    private readonly environment: Environment
  ) {
    const entryBlock = createBlock(environment);
    this.blocks.set(entryBlock.id, entryBlock);
    this.currentBlock = entryBlock;
  }

  public build(): HIR {
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

  #buildBindings(bindingsPath: NodePath) {
    bindingsPath.traverse({
      Declaration: (path: NodePath<t.Declaration>) => {
        switch (path.node.type) {
          case "FunctionDeclaration": {
            path.assertFunctionDeclaration();

            // For function declarations, we only want direct children
            // of the binding path. The nested function declarations
            // are not in the scope of the current path.
            const parentPath = path.parentPath;
            if (
              !parentPath.isExportDefaultDeclaration() &&
              parentPath !== bindingsPath
            ) {
              return;
            }

            const functionName = getFunctionName(path);
            if (functionName === null) {
              return;
            }

            const identifier = createIdentifier(this.environment);
            this.#registerDeclarationName(
              functionName.node.name,
              identifier.declarationId,
              bindingsPath
            );

            // Rename the variable name in the scope to the temporary place.
            bindingsPath.scope.rename(functionName.node.name, identifier.name);
            this.#registerDeclarationName(
              identifier.name,
              identifier.declarationId,
              bindingsPath
            );

            const place = createPlace(identifier, this.environment);
            this.#registerDeclarationPlace(identifier.declarationId, place);

            break;
          }

          case "VariableDeclaration": {
            path.assertVariableDeclaration();

            const isHoistable =
              bindingsPath.isFunctionDeclaration() && path.node.kind === "var";
            const parentPath = path.parentPath;
            if (
              !parentPath.isExportDeclaration() &&
              parentPath !== bindingsPath &&
              !isHoistable
            ) {
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
    if (bindingsPath.isFunctionDeclaration() || bindingsPath.isObjectMethod()) {
      const paramPaths = bindingsPath.get("params");
      if (!Array.isArray(paramPaths)) {
        throw new Error(`Expected params to be an array`);
      }

      for (const paramPath of paramPaths) {
        if (
          !paramPath.isIdentifier() &&
          !paramPath.isRestElement() &&
          !paramPath.isPattern()
        ) {
          throw new Error(`Unsupported parameter type: ${paramPath.type}`);
        }

        this.#buildParameterBindings(paramPath, bindingsPath);
      }
    }
  }

  #buildLValBindings(nodePath: NodePath<t.LVal>, bindingsPath: NodePath) {
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

  #buildIdentifierBindings(
    nodePath: NodePath<t.Identifier>,
    bindingsPath: NodePath
  ) {
    const identifier = createIdentifier(this.environment);
    this.#registerDeclarationName(
      nodePath.node.name,
      identifier.declarationId,
      bindingsPath
    );

    // Rename the variable name in the scope to the temporary place.
    bindingsPath.scope.rename(nodePath.node.name, identifier.name);
    this.#registerDeclarationName(
      identifier.name,
      identifier.declarationId,
      bindingsPath
    );

    const place = createPlace(identifier, this.environment);
    this.#registerDeclarationPlace(identifier.declarationId, place);
  }

  #buildArrayPatternBindings(
    nodePath: NodePath<t.ArrayPattern>,
    bindingsPath: NodePath
  ) {
    const elementsPath: NodePath<t.ArrayPattern["elements"][number]>[] =
      nodePath.get("elements");
    for (const elementPath of elementsPath) {
      elementPath.assertLVal();
      this.#buildLValBindings(elementPath, bindingsPath);
    }
  }

  #buildObjectPatternBindings(
    nodePath: NodePath<t.ObjectPattern>,
    bindingsPath: NodePath
  ) {
    const propertiesPath = nodePath.get("properties");
    for (const propertyPath of propertiesPath) {
      if (!propertyPath.isLVal()) {
        throw new Error(`Unsupported property type: ${propertyPath.type}`);
      }

      this.#buildLValBindings(propertyPath, bindingsPath);
    }
  }

  #buildRestElementBindings(
    nodePath: NodePath<t.RestElement>,
    bindingsPath: NodePath
  ) {
    const elementPath = nodePath.get("argument");
    this.#buildLValBindings(elementPath, bindingsPath);
  }

  #buildParameterBindings(
    nodePath: NodePath<t.Identifier | t.RestElement | t.Pattern>,
    bindingsPath: NodePath
  ) {
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
   * Node Building
   *
   * Methods for building HIR from different types of nodes
   ******************************************************************************/

  #buildNode(nodePath: NodePath<t.Node>): Place | undefined {
    if (nodePath.isExpression() || nodePath.isIdentifier()) {
      return this.#buildExpression(nodePath);
    } else if (nodePath.isStatement()) {
      this.#buildStatement(nodePath);
      return;
    }

    throw new Error(`Unsupported node type: ${nodePath.type}`);
  }

  /******************************************************************************
   * Statement Building
   *
   * Methods for building HIR from different types of statement nodes
   ******************************************************************************/
  #buildStatement(statementPath: NodePath<t.Statement>): Place | undefined {
    switch (statementPath.type) {
      case "BlockStatement":
        statementPath.assertBlockStatement();
        this.#buildBlockStatement(statementPath);
        break;
      case "ExportDefaultDeclaration":
        statementPath.assertExportDefaultDeclaration();
        this.#buildExportDefaultDeclaration(statementPath);
        break;
      case "ExpressionStatement":
        statementPath.assertExpressionStatement();
        this.#buildExpressionStatement(statementPath);
        break;
      case "ForStatement":
        statementPath.assertForStatement();
        this.#buildForStatement(statementPath);
        break;
      case "FunctionDeclaration":
        statementPath.assertFunctionDeclaration();
        return this.#buildFunctionDeclaration(statementPath);
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

  #buildBlockStatement(statementPath: NodePath<t.BlockStatement>) {
    const currentBlock = this.currentBlock;

    const block = createBlock(this.environment);
    this.blocks.set(block.id, block);
    this.currentBlock = block;

    this.#buildBindings(statementPath);

    const body = statementPath.get("body");
    for (const statementPath of body) {
      this.#buildStatement(statementPath);
    }

    currentBlock.terminal = new JumpTerminal(
      makeInstructionId(this.environment.nextInstructionId++),
      block.id
    );
  }

  #buildExportDefaultDeclaration(
    statementPath: NodePath<t.ExportDefaultDeclaration>
  ): Place {
    const declarationPath = statementPath.get("declaration");
    const declarationPlace = this.#buildNode(declarationPath);
    if (declarationPlace === undefined) {
      throw new Error("Unable to find the place for declaration");
    }

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);
    const instructionId = makeInstructionId(
      this.environment.nextInstructionId++
    );
    this.currentBlock.instructions.push(
      new ExportDefaultDeclarationInstruction(
        instructionId,
        place,
        statementPath,
        declarationPlace
      )
    );

    this.environment.exportToPlaces.set("default", place);
    return place;
  }

  #buildExpressionAsStatement(expressionPath: NodePath<t.Expression>) {
    const expressionPlace = this.#buildExpression(expressionPath);

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);

    const instructionId = makeInstructionId(
      this.environment.nextInstructionId++
    );
    this.currentBlock.instructions.push(
      new ExpressionStatementInstruction(
        instructionId,
        place,
        expressionPath,
        expressionPlace
      )
    );
  }

  #buildExpressionStatement(statementPath: NodePath<t.ExpressionStatement>) {
    const expressionPath = statementPath.get("expression");
    const expressionPlace = this.#buildExpression(expressionPath);

    // For assignments, since we convert them to a store instruction,
    // we do not need to emit an expression statement instruction.
    const expressionInstruction = this.currentBlock.instructions.at(-1);
    if (
      expressionInstruction instanceof StatementInstruction &&
      expressionInstruction.place === expressionPlace
    ) {
      return;
    }

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);
    const instructionId = makeInstructionId(
      this.environment.nextInstructionId++
    );
    this.currentBlock.instructions.push(
      new ExpressionStatementInstruction(
        instructionId,
        place,
        expressionPath,
        expressionPlace
      )
    );
  }

  #buildForStatement(statementPath: NodePath<t.ForStatement>) {
    const currentBlock = this.currentBlock;

    // Build the init block.
    const initPath: NodePath<t.ForStatement["init"]> =
      statementPath.get("init");
    const initBlock = createBlock(this.environment);
    this.blocks.set(initBlock.id, initBlock);

    this.currentBlock = initBlock;
    if (initPath.hasNode()) {
      // If the init is an expression, wrap it with an expression statement.
      if (initPath.isExpression()) {
        initPath.replaceWith(t.expressionStatement(initPath.node));
      }

      initPath.assertStatement();
      this.#buildBindings(statementPath);
      this.#buildStatement(initPath);
    }
    const initBlockTerminus = this.currentBlock;

    // Build the test block.
    const testPath: NodePath<t.ForStatement["test"]> =
      statementPath.get("test");
    const testBlock = createBlock(this.environment);
    this.blocks.set(testBlock.id, testBlock);

    // If the test is not provided, it is equivalent to while(true).
    if (!testPath.hasNode()) {
      testPath.replaceWith(t.valueToNode(true));
    }
    testPath.assertExpression();

    this.currentBlock = testBlock;
    const testPlace = this.#buildExpression(testPath);
    const testBlockTerminus = this.currentBlock;

    // Build the body block.
    const bodyPath = statementPath.get("body");
    const bodyBlock = createBlock(this.environment);
    this.blocks.set(bodyBlock.id, bodyBlock);

    this.currentBlock = bodyBlock;
    this.#buildStatement(bodyPath);

    // Build the update inside body block.
    const updatePath: NodePath<t.ForStatement["update"]> =
      statementPath.get("update");
    if (updatePath.hasNode()) {
      this.#buildExpressionAsStatement(updatePath);
    }

    const bodyBlockTerminus = this.currentBlock;

    // Build the exit block.
    const exitBlock = createBlock(this.environment);
    this.blocks.set(exitBlock.id, exitBlock);

    // Set the jump terminal for init block to test block.
    initBlockTerminus.terminal = new JumpTerminal(
      makeInstructionId(this.environment.nextInstructionId++),
      testBlock.id
    );

    // Set the branch terminal for test block.
    testBlockTerminus.terminal = new BranchTerminal(
      makeInstructionId(this.environment.nextInstructionId++),
      testPlace,
      bodyBlock.id,
      exitBlock.id,
      exitBlock.id
    );

    // Set the jump terminal for body block to create a back edge.
    bodyBlockTerminus.terminal = new JumpTerminal(
      makeInstructionId(this.environment.nextInstructionId++),
      testBlock.id
    );

    // Set the jump terminal for the current block.
    currentBlock.terminal = new JumpTerminal(
      makeInstructionId(this.environment.nextInstructionId++),
      initBlock.id
    );

    this.currentBlock = exitBlock;
  }

  #buildFunctionDeclaration(
    statementPath: NodePath<t.FunctionDeclaration>
  ): Place {
    const currentBlock = this.currentBlock;

    // Build the body block.
    const bodyBlock = createBlock(this.environment);
    this.blocks.set(bodyBlock.id, bodyBlock);

    this.currentBlock = bodyBlock;

    this.#buildBindings(statementPath);

    const params = statementPath.get("params");
    const paramPlaces = params.map((param) => {
      if (!param.isIdentifier()) {
        throw new Error(`Unsupported parameter type: ${param.type}`);
      }

      const declarationId = this.#getDeclarationId(
        param.node.name,
        statementPath
      );
      if (declarationId === undefined) {
        throw new Error(
          `Variable accessed before declaration: ${param.node.name}`
        );
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

    const declarationId = this.#getDeclarationId(
      functionName.node.name,
      statementPath
    );
    if (declarationId === undefined) {
      throw new Error(
        `Function accessed before declaration: ${functionName.node.name}`
      );
    }

    const functionPlace = this.#getLatestDeclarationPlace(declarationId);
    if (functionPlace === undefined) {
      throw new Error(
        `Unable to find the place for ${functionName.node.name} (${declarationId})`
      );
    }

    const instruction = new FunctionDeclarationInstruction(
      makeInstructionId(this.environment.nextInstructionId++),
      functionPlace,
      statementPath,
      paramPlaces,
      bodyBlock.id,
      statementPath.node.generator,
      statementPath.node.async
    );
    currentBlock.instructions.push(instruction);

    // Set the terminal for the current block.
    currentBlock.terminal = new JumpTerminal(
      makeInstructionId(this.environment.nextInstructionId++),
      bodyBlock.id
    );

    this.currentBlock = currentBlock;
    return functionPlace;
  }

  #buildIfStatement(statementPath: NodePath<t.IfStatement>) {
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
    this.currentBlock.terminal = new JumpTerminal(
      makeInstructionId(this.environment.nextInstructionId++),
      joinBlock.id
    );

    // Build the alternate block
    const alternatePath = statementPath.get("alternate");
    let alternateBlock: BasicBlock | undefined = currentBlock;
    if (alternatePath.hasNode()) {
      alternateBlock = createBlock(this.environment);
      this.blocks.set(alternateBlock.id, alternateBlock);

      this.currentBlock = alternateBlock;
      this.#buildStatement(alternatePath);
    }

    // After building the alternate block, we need to set the terminal
    // from the last block to the join block.
    this.currentBlock.terminal = new JumpTerminal(
      makeInstructionId(this.environment.nextInstructionId++),
      joinBlock.id
    );

    // Set branch terminal for the current block.
    currentBlock.terminal = new BranchTerminal(
      makeInstructionId(this.environment.nextInstructionId++),
      testPlace,
      consequentBlock.id,
      alternateBlock.id,
      joinBlock.id
    );

    this.currentBlock = joinBlock;
  }

  #buildReturnStatement(statementPath: NodePath<t.ReturnStatement>) {
    const argument = statementPath.get("argument");
    if (!argument.hasNode()) {
      return;
    }

    const valuePlace = this.#buildExpression(argument);
    this.currentBlock.terminal = new ReturnTerminal(
      makeInstructionId(this.environment.nextInstructionId++),
      valuePlace
    );
  }

  #buildVariableDeclaration(statementPath: NodePath<t.VariableDeclaration>) {
    const declarations = statementPath.get("declarations");
    for (const declaration of declarations) {
      const id = declaration.get("id");
      const lvalPlace = this.#buildLVal(id, true);

      const init: NodePath<t.Expression | null | undefined> =
        declaration.get("init");
      let valuePlace: Place;
      if (!init.hasNode()) {
        init.replaceWith(t.identifier("undefined"));
        init.assertIdentifier({ name: "undefined" });
        valuePlace = this.#buildIdentifier(init);
      } else {
        valuePlace = this.#buildExpression(init);
      }

      const identifier = createIdentifier(this.environment);
      const place = createPlace(identifier, this.environment);

      const instructionId = makeInstructionId(
        this.environment.nextInstructionId++
      );
      this.currentBlock.instructions.push(
        new StoreLocalInstruction(
          instructionId,
          place,
          statementPath,
          lvalPlace,
          valuePlace,
          "const"
        )
      );
    }
  }

  #buildWhileStatement(statementPath: NodePath<t.WhileStatement>) {
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
    testBlockTerminus.terminal = new BranchTerminal(
      makeInstructionId(this.environment.nextInstructionId++),
      testPlace,
      bodyBlock.id,
      exitBlock.id,
      exitBlock.id
    );

    // Set the jump terminal for body block to create a back edge.
    bodyBlockTerminus.terminal = new JumpTerminal(
      makeInstructionId(this.environment.nextInstructionId++),
      testBlock.id
    );

    // Set the jump terminal for the current block.
    currentBlock.terminal = new JumpTerminal(
      makeInstructionId(this.environment.nextInstructionId++),
      testBlock.id
    );

    this.currentBlock = exitBlock;
  }

  #buildUnsupportedStatement(statementPath: NodePath<t.Statement>) {
    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);

    this.currentBlock.instructions.push(
      new UnsupportedNodeInstruction(
        makeInstructionId(this.environment.nextInstructionId++),
        place,
        statementPath,
        statementPath.node
      )
    );
  }

  /******************************************************************************
   * Expression Building
   *
   * Methods for building HIR from different types of expression nodes
   ******************************************************************************/
  #buildExpression(expressionPath: NodePath<t.Expression>): Place {
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
      case "JSXElement":
        expressionPath.assertJSXElement();
        return this.#buildJSXElement(expressionPath);
      case "JSXFragment":
        expressionPath.assertJSXFragment();
        return this.#buildJSXFragment(expressionPath);
      case "LogicalExpression":
        expressionPath.assertLogicalExpression();
        return this.#buildLogicalExpression(expressionPath);
      case "MemberExpression":
        expressionPath.assertMemberExpression();
        return this.#buildMemberExpression(expressionPath);
      case "ObjectExpression":
        expressionPath.assertObjectExpression();
        return this.#buildObjectExpression(expressionPath);
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

  #buildArrayExpression(expressionPath: NodePath<t.ArrayExpression>): Place {
    const elementsPath = expressionPath.get("elements");
    const elementPlaces = elementsPath.map(
      (elementPath: NodePath<t.ArrayExpression["elements"][number]>) => {
        if (elementPath.node === null) {
          return this.#buildHole(elementPath as NodePath<null>);
        }

        if (elementPath.isSpreadElement()) {
          return this.#buildSpreadElement(elementPath);
        }

        elementPath.assertExpression();
        return this.#buildExpression(elementPath);
      }
    );

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);

    const instructionId = makeInstructionId(
      this.environment.nextInstructionId++
    );
    this.currentBlock.instructions.push(
      new ArrayExpressionInstruction(
        instructionId,
        place,
        expressionPath,
        elementPlaces
      )
    );

    return place;
  }

  #buildAssignmentExpression(
    expressionPath: NodePath<t.AssignmentExpression>
  ): Place {
    const leftPath = expressionPath.get("left");
    if (!leftPath.isIdentifier()) {
      throw new Error(`Unsupported left expression type: ${leftPath.type}`);
    }

    const declarationId = this.#getDeclarationId(
      leftPath.node.name,
      expressionPath
    );
    if (declarationId === undefined) {
      throw new Error(
        `Variable accessed before declaration: ${leftPath.node.name}`
      );
    }

    const lvalIdentifier = createIdentifier(this.environment, declarationId);
    const lvalPlace = createPlace(lvalIdentifier, this.environment);

    const rightPath = expressionPath.get("right");
    const rightPlace = this.#buildExpression(rightPath);

    // Create a new place for this assignment using the same declarationId
    const identifier = createIdentifier(this.environment, declarationId);
    const place = createPlace(identifier, this.environment);

    this.#registerDeclarationPlace(declarationId, lvalPlace);

    const instructionId = makeInstructionId(
      this.environment.nextInstructionId++
    );
    this.currentBlock.instructions.push(
      new StoreLocalInstruction(
        instructionId,
        place,
        expressionPath,
        lvalPlace,
        rightPlace,
        "const"
      )
    );

    return place;
  }

  #buildBinaryExpression(expressionPath: NodePath<t.BinaryExpression>): Place {
    const leftPath = expressionPath.get("left");
    if (!leftPath.isExpression()) {
      throw new Error(`Unsupported left expression type: ${leftPath.type}`);
    }

    const leftPlace = this.#buildExpression(leftPath);

    const rightPath = expressionPath.get("right");
    const rightPlace = this.#buildExpression(rightPath);

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);

    const instructionId = makeInstructionId(
      this.environment.nextInstructionId++
    );
    this.currentBlock.instructions.push(
      new BinaryExpressionInstruction(
        instructionId,
        place,
        expressionPath,
        expressionPath.node.operator,
        leftPlace,
        rightPlace
      )
    );

    return place;
  }

  #buildCallExpression(expressionPath: NodePath<t.CallExpression>): Place {
    const calleePath = expressionPath.get("callee");
    if (!calleePath.isExpression()) {
      throw new Error(`Unsupported callee type: ${calleePath.type}`);
    }

    const calleePlace = this.#buildExpression(calleePath);

    const argumentsPath = expressionPath.get("arguments");
    const argumentPlaces = argumentsPath.map(
      (argumentPath: NodePath<t.CallExpression["arguments"][number]>) => {
        if (argumentPath.isSpreadElement()) {
          return this.#buildSpreadElement(argumentPath);
        }

        argumentPath.assertExpression();
        return this.#buildExpression(argumentPath);
      }
    );

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);

    const instructionId = makeInstructionId(
      this.environment.nextInstructionId++
    );
    this.currentBlock.instructions.push(
      new CallExpressionInstruction(
        instructionId,
        place,
        expressionPath,
        calleePlace,
        argumentPlaces
      )
    );

    return place;
  }

  /**
   * Builds a place for an identifier. If the identifier is not a variable declarator,
   * a load instruction is created to load the identifier from the scope.
   */
  #buildIdentifier(
    expressionPath: NodePath<t.Identifier>,
    isVariableDeclaratorId: boolean = false
  ): Place {
    const name = expressionPath.node.name;

    const declarationId = this.#getDeclarationId(name, expressionPath);
    if (declarationId === undefined) {
      const identifier = createIdentifier(this.environment);
      const place = createPlace(identifier, this.environment);

      this.currentBlock.instructions.push(
        new LoadGlobalInstruction(
          makeInstructionId(this.environment.nextInstructionId++),
          place,
          expressionPath,
          name
        )
      );

      return place;
    }

    const valuePlace = this.#getLatestDeclarationPlace(declarationId);
    if (valuePlace === undefined) {
      throw new Error(
        `Unable to find the place for ${name} (${declarationId})`
      );
    }

    // If we're building a variable declarator id, we don't need to (and can't)
    // load the value, because up until now, the value has not been declared yet.
    if (isVariableDeclaratorId) {
      return valuePlace;
    }

    const instructionId = makeInstructionId(
      this.environment.nextInstructionId++
    );
    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);
    this.currentBlock.instructions.push(
      new LoadLocalInstruction(instructionId, place, expressionPath, valuePlace)
    );

    return place;
  }

  #buildLogicalExpression(
    expressionPath: NodePath<t.LogicalExpression>
  ): Place {
    const leftPath = expressionPath.get("left");
    const leftPlace = this.#buildExpression(leftPath);

    const rightPath = expressionPath.get("right");
    const rightPlace = this.#buildExpression(rightPath);

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);
    this.currentBlock.instructions.push(
      new LogicalExpressionInstruction(
        makeInstructionId(this.environment.nextInstructionId++),
        place,
        expressionPath,
        expressionPath.node.operator,
        leftPlace,
        rightPlace
      )
    );

    return place;
  }

  #buildMemberExpression(expressionPath: NodePath<t.MemberExpression>): Place {
    const objectPath = expressionPath.get("object");
    const objectPlace = this.#buildExpression(objectPath);

    const propertyPath = expressionPath.get("property");
    if (!propertyPath.isIdentifier()) {
      throw new Error(`Unsupported property type: ${propertyPath.type}`);
    }

    const propertyPlace = this.#buildExpression(propertyPath);

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);
    this.currentBlock.instructions.push(
      new MemberExpressionInstruction(
        makeInstructionId(this.environment.nextInstructionId++),
        place,
        expressionPath,
        objectPlace,
        propertyPlace,
        expressionPath.node.computed
      )
    );

    return place;
  }

  #buildObjectExpression(expressionPath: NodePath<t.ObjectExpression>): Place {
    const propertiesPath = expressionPath.get("properties");
    const propertyPlaces = propertiesPath.map(
      (propertyPath: NodePath<t.ObjectExpression["properties"][number]>) => {
        if (propertyPath.isSpreadElement()) {
          return this.#buildSpreadElement(propertyPath);
        } else if (propertyPath.isObjectMethod()) {
          return this.#buildObjectMethod(propertyPath);
        } else if (propertyPath.isObjectProperty()) {
          return this.#buildObjectProperty(propertyPath);
        }

        throw new Error(`Unsupported property type: ${propertyPath.type}`);
      }
    );

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);
    this.currentBlock.instructions.push(
      new ObjectExpressionInstruction(
        makeInstructionId(this.environment.nextInstructionId++),
        place,
        expressionPath,
        propertyPlaces
      )
    );

    return place;
  }

  #buildObjectMethod(methodPath: NodePath<t.ObjectMethod>): Place {
    const currentBlock = this.currentBlock;

    // Build the key place
    const keyPath = methodPath.get("key");
    const keyPlace = this.#buildNode(keyPath);
    if (keyPlace === undefined) {
      throw new Error(`Unable to build key place for ${methodPath.type}`);
    }

    // Build the body block.
    const bodyBlock = createBlock(this.environment);
    this.blocks.set(bodyBlock.id, bodyBlock);

    this.currentBlock = bodyBlock;

    this.#buildBindings(methodPath);

    const params = methodPath.get("params");
    const paramPlaces = params.map((param) => {
      if (!param.isIdentifier()) {
        throw new Error(`Unsupported parameter type: ${param.type}`);
      }

      const declarationId = this.#getDeclarationId(param.node.name, methodPath);
      if (declarationId === undefined) {
        throw new Error(
          `Variable accessed before declaration: ${param.node.name}`
        );
      }

      const place = this.#getLatestDeclarationPlace(declarationId);
      if (place === undefined) {
        throw new Error(`Unable to find the place for ${param.node.name}`);
      }

      return place;
    });

    const bodyPath = methodPath.get("body");
    this.currentBlock = bodyBlock;
    this.#buildStatement(bodyPath);

    const methodIdentifier = createIdentifier(this.environment);
    const methodPlace = createPlace(methodIdentifier, this.environment);

    const instruction = new ObjectMethodInstruction(
      makeInstructionId(this.environment.nextInstructionId++),
      methodPlace,
      methodPath,
      keyPlace,
      paramPlaces,
      bodyBlock.id,
      methodPath.node.computed,
      methodPath.node.generator,
      methodPath.node.async,
      methodPath.node.kind
    );
    currentBlock.instructions.push(instruction);

    // Set the terminal for the current block.
    currentBlock.terminal = new JumpTerminal(
      makeInstructionId(this.environment.nextInstructionId++),
      bodyBlock.id
    );

    this.currentBlock = currentBlock;
    return methodPlace;
  }

  #buildObjectProperty(propertyPath: NodePath<t.ObjectProperty>): Place {
    const keyPath = propertyPath.get("key");
    const keyPlace = this.#buildNode(keyPath);
    if (keyPlace === undefined) {
      throw new Error(`Unable to build key place for ${propertyPath.type}`);
    }

    const valuePath = propertyPath.get("value");
    const valuePlace = this.#buildNode(valuePath);
    if (valuePlace === undefined) {
      throw new Error(`Unable to build value place for ${propertyPath.type}`);
    }

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);
    this.currentBlock.instructions.push(
      new ObjectPropertyInstruction(
        makeInstructionId(this.environment.nextInstructionId++),
        place,
        propertyPath,
        keyPlace,
        valuePlace,
        propertyPath.node.computed,
        propertyPath.node.shorthand
      )
    );
    return place;
  }

  #buildUpdateExpression(expressionPath: NodePath<t.UpdateExpression>): Place {
    const argumentPath = expressionPath.get("argument");
    if (!argumentPath.isIdentifier()) {
      throw new Error(`Unsupported argument type: ${argumentPath.type}`);
    }

    const declarationId = this.#getDeclarationId(
      argumentPath.node.name,
      expressionPath
    );
    if (declarationId === undefined) {
      throw new Error(
        `Variable accessed before declaration: ${argumentPath.node.name}`
      );
    }

    const originalPlace = this.#getLatestDeclarationPlace(declarationId);
    if (originalPlace === undefined) {
      throw new Error(
        `Unable to find the place for ${argumentPath.node.name} (${declarationId})`
      );
    }

    const lvalIdentifier = createIdentifier(this.environment, declarationId);
    const lvalPlace = createPlace(lvalIdentifier, this.environment);

    const rightLiteral = t.numericLiteral(1);
    const isIncrement = expressionPath.node.operator === "++";
    const binaryExpression = t.binaryExpression(
      isIncrement ? "+" : "-",
      argumentPath.node,
      rightLiteral
    );
    const binaryExpressionPath = this.#createSyntheticBinaryPath(
      expressionPath,
      binaryExpression
    );

    const valuePlace = this.#buildBinaryExpression(binaryExpressionPath);

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);

    this.#registerDeclarationPlace(declarationId, lvalPlace);

    this.currentBlock.instructions.push(
      new StoreLocalInstruction(
        makeInstructionId(this.environment.nextInstructionId++),
        place,
        expressionPath,
        lvalPlace,
        valuePlace,
        "const"
      )
    );
    return expressionPath.node.prefix ? valuePlace : originalPlace;
  }

  #buildUnaryExpression(expressionPath: NodePath<t.UnaryExpression>): Place {
    const argumentPath = expressionPath.get("argument");
    const argumentPlace = this.#buildExpression(argumentPath);

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);

    const instructionId = makeInstructionId(
      this.environment.nextInstructionId++
    );
    this.currentBlock.instructions.push(
      new UnaryExpressionInstruction(
        instructionId,
        place,
        expressionPath,
        expressionPath.node.operator,
        argumentPlace
      )
    );

    return place;
  }

  #buildLiteral(expressionPath: NodePath<t.Literal>): Place {
    if (
      !t.isNumericLiteral(expressionPath.node) &&
      !t.isStringLiteral(expressionPath.node) &&
      !t.isBooleanLiteral(expressionPath.node)
    ) {
      throw new Error(`Unsupported literal type: ${expressionPath.type}`);
    }

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);

    const instructionId = makeInstructionId(
      this.environment.nextInstructionId++
    );
    this.currentBlock.instructions.push(
      new LiteralInstruction(
        instructionId,
        place,
        expressionPath,
        expressionPath.node.value
      )
    );

    return place;
  }

  #buildUnsupportedExpression(expressionPath: NodePath<t.Expression>) {
    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);

    this.currentBlock.instructions.push(
      new UnsupportedNodeInstruction(
        makeInstructionId(this.environment.nextInstructionId++),
        place,
        expressionPath,
        expressionPath.node
      )
    );

    return place;
  }

  /******************************************************************************
   * Pattern Building
   *
   * Methods for building HIR from pattern nodes like array and object patterns
   ******************************************************************************/

  #buildPattern(patternPath: NodePath<t.LVal>): Place {
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

  #buildArrayPattern(patternPath: NodePath<t.ArrayPattern>): Place {
    const elementPaths = patternPath.get("elements");
    const elementPlaces = elementPaths.map((elementPath) => {
      if (elementPath.node == null) {
        assertNullPath(elementPath);
        return this.#buildHole(elementPath);
      } else if (elementPath.isPattern()) {
        return this.#buildPattern(elementPath);
      } else if (elementPath.isLVal()) {
        return this.#buildLVal(elementPath);
      }

      throw new Error(`Unsupported element type: ${elementPath.type}`);
    });

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);

    this.currentBlock.instructions.push(
      new ArrayPatternInstruction(
        makeInstructionId(this.environment.nextInstructionId++),
        place,
        patternPath,
        elementPlaces
      )
    );

    return place;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  #buildObjectPattern(patternPath: NodePath<t.ObjectPattern>): Place {
    throw new Error("Not implemented");
  }

  #buildUnsupportedPattern(patternPath: NodePath<t.LVal>): Place {
    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);

    this.currentBlock.instructions.push(
      new UnsupportedNodeInstruction(
        makeInstructionId(this.environment.nextInstructionId++),
        place,
        patternPath,
        patternPath.node
      )
    );

    return place;
  }

  /******************************************************************************
   * LVal Building
   *
   * Methods for building HIR from LVal nodes like identifiers, array patterns,
   * object patterns, and rest elements. LVal nodes represent the left side of
   * assignments and declarations.
   ******************************************************************************/
  #buildLVal(
    lvalPath: NodePath<t.LVal>,
    isVariableDeclaratorId: boolean = false
  ): Place {
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

  #buildUnsupportedLVal(lvalPath: NodePath<t.LVal>): Place {
    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);

    this.currentBlock.instructions.push(
      new UnsupportedNodeInstruction(
        makeInstructionId(this.environment.nextInstructionId++),
        place,
        lvalPath,
        lvalPath.node
      )
    );

    return place;
  }

  /******************************************************************************
   * JSX Building
   *
   * Methods for building HIR from JSX nodes like elements, attributes, and text
   ******************************************************************************/

  #buildJSX(
    nodePath: NodePath<
      | t.JSXText
      | t.JSXExpressionContainer
      | t.JSXSpreadChild
      | t.JSXElement
      | t.JSXFragment
    >
  ): Place {
    switch (nodePath.type) {
      case "JSXElement":
        nodePath.assertJSXElement();
        return this.#buildJSXElement(nodePath);
      case "JSXFragment":
        nodePath.assertJSXFragment();
        return this.#buildJSXFragment(nodePath);
      case "JSXText":
        nodePath.assertJSXText();
        return this.#buildJSXText(nodePath);
      default:
        return this.#buildUnsupportedJSX(nodePath);
    }
  }

  #buildJSXElement(expressionPath: NodePath<t.JSXElement>): Place {
    const openingElementPath = expressionPath.get("openingElement");
    const openingElementPlace =
      this.#buildJSXOpeningElement(openingElementPath);

    const closingElementPath = expressionPath.get("closingElement");
    const closingElementPlace =
      this.#buildJSXClosingElement(closingElementPath);

    const childrenPath = expressionPath.get("children");
    const childrenPlaces = childrenPath.map((childPath) =>
      this.#buildJSX(childPath)
    );

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);
    this.currentBlock.instructions.push(
      new JSXElementInstruction(
        makeInstructionId(this.environment.nextInstructionId++),
        place,
        expressionPath,
        openingElementPlace,
        closingElementPlace,
        childrenPlaces
      )
    );

    return place;
  }
  #buildJSXClosingElement(
    expressionPath: NodePath<t.JSXClosingElement | null | undefined>
  ): Place {
    return this.#buildUnsupportedExpression(
      expressionPath as unknown as NodePath<t.Expression>
    );
  }

  #buildJSXClosingFragment(
    expressionPath: NodePath<t.JSXClosingFragment>
  ): Place {
    return this.#buildUnsupportedExpression(
      expressionPath as unknown as NodePath<t.Expression>
    );
  }

  #buildJSXFragment(expressionPath: NodePath<t.JSXFragment>): Place {
    const openingFragmentPath = expressionPath.get("openingFragment");
    const openingFragmentPlace =
      this.#buildJSXOpeningFragment(openingFragmentPath);

    const closingFragmentPath = expressionPath.get("closingFragment");
    const closingFragmentPlace =
      this.#buildJSXClosingFragment(closingFragmentPath);

    const childrenPath = expressionPath.get("children");
    const childrenPlaces = childrenPath.map((childPath) =>
      this.#buildJSX(childPath)
    );

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);
    this.currentBlock.instructions.push(
      new JSXFragmentInstruction(
        makeInstructionId(this.environment.nextInstructionId++),
        place,
        expressionPath,
        openingFragmentPlace,
        closingFragmentPlace,
        childrenPlaces
      )
    );

    return place;
  }

  #buildJSXOpeningElement(
    expressionPath: NodePath<t.JSXOpeningElement>
  ): Place {
    return this.#buildUnsupportedJSX(expressionPath);
  }

  #buildJSXOpeningFragment(
    expressionPath: NodePath<t.JSXOpeningFragment>
  ): Place {
    return this.#buildUnsupportedJSX(expressionPath);
  }

  #buildJSXText(expressionPath: NodePath<t.JSXText>): Place {
    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);

    this.currentBlock.instructions.push(
      new JSXTextInstruction(
        makeInstructionId(this.environment.nextInstructionId++),
        place,
        expressionPath,
        expressionPath.node.value
      )
    );

    return place;
  }

  #buildUnsupportedJSX(expressionPath: NodePath<t.JSX>): Place {
    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);

    this.currentBlock.instructions.push(
      new UnsupportedNodeInstruction(
        makeInstructionId(this.environment.nextInstructionId++),
        place,
        expressionPath,
        expressionPath.node
      )
    );

    return place;
  }

  /******************************************************************************
   * Misc Node Building
   *
   * Methods for building HIR from miscellaneous node types like holes and spread
   ******************************************************************************/

  #buildHole(expressionPath: NodePath<null>): Place {
    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);

    this.currentBlock.instructions.push(
      new HoleInstruction(
        makeInstructionId(this.environment.nextInstructionId++),
        place,
        expressionPath
      )
    );

    return place;
  }

  #buildSpreadElement(expressionPath: NodePath<t.SpreadElement>): Place {
    const argumentPath = expressionPath.get("argument");
    const argumentPlace = this.#buildExpression(argumentPath);

    const identifier = createIdentifier(this.environment);
    const place = createPlace(identifier, this.environment);

    this.currentBlock.instructions.push(
      new SpreadElementInstruction(
        makeInstructionId(this.environment.nextInstructionId++),
        place,
        expressionPath,
        argumentPlace
      )
    );

    return place;
  }

  /******************************************************************************
   * Utils
   *
   * Utility methods used by the HIR builder
   ******************************************************************************/
  #registerDeclarationName(
    name: string,
    declarationId: DeclarationId,
    nodePath: NodePath<t.Node>
  ) {
    nodePath.scope.setData(name, declarationId);
  }

  #getDeclarationId(
    name: string,
    nodePath: NodePath<t.Node>
  ): DeclarationId | undefined {
    return nodePath.scope.getData(name);
  }

  #registerDeclarationPlace(declarationId: DeclarationId, place: Place) {
    let places = this.environment.declToPlaces.get(declarationId);
    places ??= [];
    places.push({ blockId: this.currentBlock.id, place });
    this.environment.declToPlaces.set(declarationId, places);
  }

  #getLatestDeclarationPlace(declarationId: DeclarationId): Place | undefined {
    const places = this.environment.declToPlaces.get(declarationId);
    return places?.at(-1)?.place;
  }
  /**
   * Creates a synthetic NodePath for a BinaryExpression by wrapping it in an ExpressionStatement.
   * This allows us to use Babel's path traversal APIs on dynamically created expressions.
   */
  #createSyntheticBinaryPath(
    parentPath: NodePath<t.Node>,
    binExpr: t.BinaryExpression
  ): NodePath<t.BinaryExpression> {
    const containerNode = t.expressionStatement(binExpr);

    const newPath = NodePath.get({
      hub: parentPath.hub,
      parentPath,
      parent: parentPath.node,
      container: containerNode,
      key: "expression",
    });

    return newPath as NodePath<t.BinaryExpression>;
  }
}

function assertNullPath<T extends t.Node>(
  path: NodePath<T | null>
): asserts path is NodePath<null> {}
