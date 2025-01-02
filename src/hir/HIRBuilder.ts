import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { getFunctionName } from "../babel-utils";
import { Environment } from "../compiler";
import {
  BasicBlock,
  BinaryExpressionInstruction,
  BlockId,
  BranchTerminal,
  createBlock,
  createIdentifier,
  createPlace,
  DeclarationId,
  ExpressionStatementInstruction,
  JumpTerminal,
  LiteralInstruction,
  LoadLocalInstruction,
  makeInstructionId,
  Place,
  ReturnTerminal,
  StatementInstruction,
  StoreLocalInstruction,
  UnsupportedNodeInstruction,
} from "../ir";
import { FunctionDeclarationInstruction } from "../ir/Instruction";

interface HIR {
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

  /**
   * Builds the bindings for the given node path.
   */
  #buildBindings(bindingsPath: NodePath) {
    bindingsPath.traverse({
      Declaration: (path: NodePath<t.Declaration>) => {
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
            if (path.parentPath !== bindingsPath && !isHoistable) {
              return;
            }

            for (const declaration of path.node.declarations) {
              if (!t.isIdentifier(declaration.id)) {
                return;
              }

              const identifier = createIdentifier(this.environment);
              this.#registerDeclarationName(
                declaration.id.name,
                identifier.declarationId,
                bindingsPath
              );

              // Rename the variable name in the scope to the temporary place.
              bindingsPath.scope.rename(declaration.id.name, identifier.name);
              this.#registerDeclarationName(
                identifier.name,
                identifier.declarationId,
                bindingsPath
              );

              const place = createPlace(identifier, this.environment);
              this.#registerDeclarationPlace(identifier.declarationId, place);
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
        if (!paramPath.isIdentifier()) {
          throw new Error(`Unsupported parameter type: ${paramPath.type}`);
        }

        const identifier = createIdentifier(this.environment);
        this.#registerDeclarationName(
          paramPath.node.name,
          identifier.declarationId,
          bindingsPath
        );

        // Rename the variable name in the scope to the temporary place.
        bindingsPath.scope.rename(paramPath.node.name, identifier.name);
        this.#registerDeclarationName(
          identifier.name,
          identifier.declarationId,
          bindingsPath
        );

        const place = createPlace(identifier, this.environment);
        this.#registerDeclarationPlace(identifier.declarationId, place);
      }
    }
  }

  /******************************************************************************
   * Statement Building
   *
   * Methods for building HIR from different types of statement nodes
   ******************************************************************************/
  #buildStatement(statementPath: NodePath<t.Statement>) {
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

  #buildFunctionDeclaration(statementPath: NodePath<t.FunctionDeclaration>) {
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

    this.currentBlock = currentBlock;
    const instruction = new FunctionDeclarationInstruction(
      makeInstructionId(this.environment.nextInstructionId++),
      functionPlace,
      statementPath,
      paramPlaces,
      bodyBlock.id
    );
    this.currentBlock.instructions.push(instruction);
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
      if (!id.isIdentifier()) {
        continue;
      }

      const declarationId = this.#getDeclarationId(id.node.name, statementPath);
      if (declarationId === undefined) {
        throw new Error(
          `Variable accessed before declaration: ${id.node.name}`
        );
      }

      const lvalPlace = this.#getLatestDeclarationPlace(declarationId);
      if (lvalPlace === undefined) {
        throw new Error(
          `Unable to find the place for ${id.node.name} (${declarationId})`
        );
      }

      const init = declaration.get("init");
      if (!init.hasNode()) {
        continue;
      }

      const valuePlace = this.#buildExpression(init);

      const identifier = createIdentifier(this.environment, declarationId);
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
      case "AssignmentExpression":
        expressionPath.assertAssignmentExpression();
        return this.#buildAssignmentExpression(expressionPath);
      case "BinaryExpression":
        expressionPath.assertBinaryExpression();
        return this.#buildBinaryExpression(expressionPath);
      case "Identifier":
        expressionPath.assertIdentifier();
        return this.#buildIdentifier(expressionPath);
      case "BooleanLiteral":
      case "NumericLiteral":
      case "StringLiteral":
        expressionPath.assertLiteral();
        return this.#buildLiteral(expressionPath);
      default:
        return this.#buildUnsupportedExpression(expressionPath);
    }
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

  #buildIdentifier(expressionPath: NodePath<t.Identifier>): Place {
    const name = expressionPath.node.name;

    const declarationId = this.#getDeclarationId(name, expressionPath);
    if (declarationId === undefined) {
      throw new Error(`Variable accessed before declaration: ${name}`);
    }

    const valuePlace = this.#getLatestDeclarationPlace(declarationId);
    if (valuePlace === undefined) {
      throw new Error(
        `Unable to find the place for ${name} (${declarationId})`
      );
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

  #buildLiteral(expressionPath: NodePath<t.Literal>) {
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
}
