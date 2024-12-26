import { NodePath, Scope } from "@babel/traverse";
import * as t from "@babel/types";
import { getExpressionName, getFunctionName } from "../Babel/utils";
import { Environment } from "../Environment";
import { BasicBlock, Block, BlockId } from "./Block";
import { DeclarationId, makeDeclarationId } from "./Declaration";
import {
  ArrayExpressionInstruction,
  BinaryExpressionInstruction,
  CallExpressionInstruction,
  ExpressionStatementInstruction,
  FunctionDeclarationInstruction,
  LiteralInstruction,
  LoadLocalInstruction,
  makeInstructionId,
  SpreadElementInstruction,
  StoreLocalInstruction,
  UnaryExpressionInstruction,
  UnsupportedNodeInstruction,
  UpdateExpressionInstruction,
} from "./Instruction";
import { Place } from "./Place";

export type Bindings = Map<DeclarationId, Map<BlockId, Place>>;

export class HIRBuilder {
  #program: NodePath<t.Program>;
  #environment: Environment;

  #blocks: Map<BlockId, Block> = new Map();

  #currentBlock!: Block;

  // ID generators
  #nextBlockId = 0;
  #nextDeclarationId = 0;
  #nextInstructionId = 0;

  constructor(program: NodePath<t.Program>, environment: Environment) {
    this.#program = program;
    this.#environment = environment;

    const entryBlock = BasicBlock.empty(this.#nextBlockId++, undefined);
    this.#blocks.set(entryBlock.id, entryBlock);
    this.#currentBlock = entryBlock;

    this.#buildBindings(program);
  }

  // Public API
  public build(): {
    blocks: Map<BlockId, Block>;
    bindings: Bindings;
  } {
    const body = this.#program.get("body");
    for (const statement of body) {
      this.#buildStatement(statement);
    }

    return {
      blocks: this.#blocks,
      bindings: this.#environment.bindings,
    };
  }

  #buildBindings(bindingPath: NodePath) {
    bindingPath.traverse({
      Declaration: (path: NodePath<t.Declaration>) => {
        switch (path.node.type) {
          case "FunctionDeclaration":
            path.assertFunctionDeclaration();

            if (path.parentPath !== bindingPath) {
              return;
            }

            const functionName = getFunctionName(path)?.node.name;
            if (functionName === undefined) {
              return;
            }

            // Set the function declaration id in the scope.
            const declarationId = makeDeclarationId(this.#nextDeclarationId++);
            bindingPath.scope.setData(functionName, declarationId);

            // Create a temporary place for the function and assign it to the declaration id.
            const place = this.#environment.createPlace({
              declarationId,
            });
            this.#environment.setBinding(
              declarationId,
              this.#currentBlock.id,
              place,
            );

            // Rename the function name in the scope to the temporary place.
            bindingPath.scope.rename(functionName, place.identifier.name);

            // Also set the declaration id for place.
            bindingPath.scope.setData(place.identifier.name, declarationId);

            break;
          case "VariableDeclaration":
            path.assertVariableDeclaration();

            if (
              path.parentPath !== bindingPath &&
              !(bindingPath.isFunctionDeclaration() && path.node.kind === "var")
            ) {
              return;
            }

            for (const declaration of path.node.declarations) {
              if (!t.isIdentifier(declaration.id)) {
                continue;
              }

              // Set the variable declaration id in the scope.
              const declarationId = makeDeclarationId(
                this.#nextDeclarationId++,
              );
              bindingPath.scope.setData(declaration.id.name, declarationId);

              // Create a temporary place for the variable and assign it to the declaration id.
              const place = this.#environment.createPlace({
                declarationId,
              });
              this.#environment.setBinding(
                declarationId,
                this.#currentBlock.id,
                place,
              );

              // Rename the variable name in the scope to the temporary place.
              bindingPath.scope.rename(
                declaration.id.name,
                place.identifier.name,
              );

              // Also set the declaration id for place.
              bindingPath.scope.setData(place.identifier.name, declarationId);
            }
            break;
        }
      },
    });
  }

  // Statement Building
  #buildStatement(statement: NodePath<t.Statement>) {
    const statementNode = statement.node;
    switch (statementNode.type) {
      case "BlockStatement":
        statement.assertBlockStatement();
        this.#buildBlockStatement(statement);
        break;
      case "ExpressionStatement":
        statement.assertExpressionStatement();
        this.#buildExpressionStatement(statement);
        break;
      case "FunctionDeclaration":
        statement.assertFunctionDeclaration();
        this.#buildFunctionDeclaration(statement);
        break;
      case "IfStatement":
        statement.assertIfStatement();
        this.#buildIfStatement(statement);
        break;
      case "ReturnStatement":
        statement.assertReturnStatement();
        this.#buildReturnStatement(statement);
        break;
      case "VariableDeclaration":
        statement.assertVariableDeclaration();
        this.#buildVariableDeclaration(statement);
        break;
      case "WhileStatement":
        statement.assertWhileStatement();
        this.#buildWhileStatement(statement);
        break;
      case "ForStatement":
      case "DoWhileStatement":
        throw new Error("Loops are not supported");
      default:
        this.#buildUnsupportedStatement(statement);
    }
  }

  #buildBlockStatement(statement: NodePath<t.BlockStatement>) {
    this.#buildBindings(statement);

    const body = statement.get("body");
    for (const stmt of body) {
      this.#buildStatement(stmt);
    }
  }

  #buildExpressionStatement(statement: NodePath<t.ExpressionStatement>) {
    const resultPlace = this.#environment.createPlace();
    const expression = statement.get("expression");
    const expressionPlace = this.#buildExpression(expression);
    this.#currentBlock.addInstruction(
      new ExpressionStatementInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        expressionPlace,
      ),
    );
  }

  #buildFunctionDeclaration(statement: NodePath<t.FunctionDeclaration>) {
    const bodyBlockId = this.#nextBlockId++;
    const bodyBlock = BasicBlock.empty(bodyBlockId, this.#currentBlock.id);
    bodyBlock.addPredecessor(this.#currentBlock.id);
    this.#blocks.set(bodyBlockId, bodyBlock);

    const functionName = getFunctionName(statement);
    if (!functionName) {
      throw new Error("Invalid function declaration");
    }

    // Get the binding for the function.
    const declarationId = statement.scope.getData(functionName.node.name);
    const functionPlace = resolveBinding(
      this.#environment.bindings,
      this.#blocks,
      declarationId,
      this.#currentBlock.id,
    );
    const instruction = new FunctionDeclarationInstruction(
      makeInstructionId(this.#nextInstructionId++),
      functionPlace,
      [], // Parameters filled later
      bodyBlockId,
    );
    this.#currentBlock.addInstruction(instruction);

    this.#buildBindings(statement);
    const params = this.#buildFunctionParameters(statement);
    instruction.params = params;

    const previousBlock = this.#currentBlock;
    this.#currentBlock = bodyBlock;

    this.#buildStatement(statement.get("body"));
    this.#currentBlock = previousBlock;
  }

  #buildFunctionParameters(statement: NodePath<t.FunctionDeclaration>) {
    const params = statement.get("params");

    return params.map((param) => {
      if (!param.isIdentifier()) {
        throw new Error("Only identifier parameters are supported");
      }

      const name = param.node.name;

      // Set the param declaration id in the function scope.
      const declarationId = makeDeclarationId(this.#nextDeclarationId++);
      statement.scope.setData(name, declarationId);

      // Create a temporary place for the param and assign it to the declaration id.
      const paramPlace = this.#environment.createPlace({
        declarationId,
      });
      this.#environment.setBinding(
        declarationId,
        this.#currentBlock.id,
        paramPlace,
      );

      // Rename the param name in the scope to the temporary place.
      statement.scope.rename(name, paramPlace.identifier.name);

      // Also set the declaration id for param place.
      statement.scope.setData(paramPlace.identifier.name, declarationId);

      return paramPlace;
    });
  }

  #buildIfStatement(statement: NodePath<t.IfStatement>) {
    const test = statement.get("test");
    const testPlace = this.#buildExpression(test);

    const currentBlock = this.#currentBlock;

    // Process consequent
    const consequent = statement.get("consequent");
    const consequentBlock = BasicBlock.empty(
      this.#nextBlockId++,
      currentBlock.id,
    );
    consequentBlock.addPredecessor(currentBlock.id);
    this.#blocks.set(consequentBlock.id, consequentBlock);

    this.#currentBlock = consequentBlock;
    this.#buildStatement(consequent);

    // Process alternate
    const alternate = statement.get("alternate");
    let alternateBlock: Block | undefined;
    if (alternate.hasNode()) {
      alternateBlock = BasicBlock.empty(this.#nextBlockId++, currentBlock.id);
      alternateBlock.addPredecessor(currentBlock.id);
      this.#blocks.set(alternateBlock.id, alternateBlock);

      this.#currentBlock = alternateBlock;
      this.#buildStatement(alternate);
    }

    // Process fallthrough
    const fallthroughBlock = BasicBlock.empty(
      this.#nextBlockId++,
      currentBlock.id,
    );
    fallthroughBlock.addPredecessor(
      this.#resolveBlockTerminalChain(consequentBlock).id,
    );

    if (alternateBlock) {
      fallthroughBlock.addPredecessor(
        this.#resolveBlockTerminalChain(alternateBlock).id,
      );
    } else {
      fallthroughBlock.addPredecessor(currentBlock.id);
    }
    this.#blocks.set(fallthroughBlock.id, fallthroughBlock);

    currentBlock.setTerminal({
      kind: "if",
      id: makeInstructionId(this.#nextInstructionId++),
      test: testPlace,
      consequent: consequentBlock.id,
      alternate: alternateBlock?.id,
      fallthrough: fallthroughBlock.id,
    });

    this.#currentBlock = fallthroughBlock;
  }

  #buildReturnStatement(statement: NodePath<t.ReturnStatement>) {
    const argument = statement.get("argument");
    if (argument.hasNode()) {
      const returnPlace = this.#buildExpression(argument);
      this.#currentBlock.setTerminal({
        kind: "return",
        id: makeInstructionId(this.#nextInstructionId++),
        value: returnPlace,
      });
    }
  }

  #buildVariableDeclaration(statement: NodePath<t.VariableDeclaration>) {
    statement.assertVariableDeclaration();
    for (const declaration of statement.get("declarations")) {
      const init = declaration.get("init");
      if (init.hasNode()) {
        const valuePlace = this.#buildExpression(init);
        const name = (declaration.node.id as t.Identifier).name;

        // Get the binding for the variable.
        const declarationId = statement.scope.getData(name);
        const targetPlace = resolveBinding(
          this.#environment.bindings,
          this.#blocks,
          declarationId,
          this.#currentBlock.id,
        );
        this.#currentBlock.addInstruction(
          new StoreLocalInstruction(
            makeInstructionId(this.#nextInstructionId++),
            targetPlace,
            valuePlace,
            statement.node.kind === "const" ? "const" : "let",
          ),
        );
      }
    }
  }

  #buildWhileStatement(statement: NodePath<t.WhileStatement>) {
    const currentBlock = this.#currentBlock;

    // Process test
    const test = statement.get("test");
    const testBlock = BasicBlock.empty(
      this.#nextBlockId++,
      this.#currentBlock.id,
    );
    testBlock.addPredecessor(this.#currentBlock.id);
    this.#blocks.set(testBlock.id, testBlock);

    this.#currentBlock = testBlock;
    this.#buildExpression(test);

    // Process body
    const body = statement.get("body");
    const bodyBlock = BasicBlock.empty(this.#nextBlockId++, currentBlock.id);
    bodyBlock.addPredecessor(testBlock.id);
    this.#blocks.set(bodyBlock.id, bodyBlock);

    this.#currentBlock = bodyBlock;
    this.#buildStatement(body);

    // Add bodyBlock as predecessor of testBlock
    testBlock.addPredecessor(this.#resolveBlockTerminalChain(bodyBlock).id);

    // Process exit
    const exitBlock = BasicBlock.empty(this.#nextBlockId++, currentBlock.id);
    exitBlock.addPredecessor(testBlock.id);
    this.#blocks.set(exitBlock.id, exitBlock);

    currentBlock.setTerminal({
      kind: "while",
      id: makeInstructionId(this.#nextInstructionId++),
      test: testBlock.id,
      body: bodyBlock.id,
      exit: exitBlock.id,
    });

    this.#currentBlock = exitBlock;
  }

  #buildUnsupportedStatement(statement: NodePath<t.Statement>) {
    const resultPlace = this.#environment.createPlace();
    this.#currentBlock.addInstruction(
      new UnsupportedNodeInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        statement.node,
      ),
    );
  }

  // Expression Building
  #buildExpression(expression: NodePath): Place {
    const expressionNode = expression.node;
    switch (expressionNode.type) {
      case "AssignmentExpression":
        expression.assertAssignmentExpression();
        return this.#buildAssignmentExpression(expression);
      case "CallExpression":
        expression.assertCallExpression();
        return this.#buildCallExpression(expression);
      case "Identifier":
        expression.assertIdentifier();
        return this.#buildIdentifier(expression);
      case "ArrayExpression":
        expression.assertArrayExpression();
        return this.#buildArrayExpression(expression);
      case "BinaryExpression":
        expression.assertBinaryExpression();
        return this.#buildBinaryExpression(expression);
      case "UnaryExpression":
        expression.assertUnaryExpression();
        return this.#buildUnaryExpression(expression);
      case "UpdateExpression":
        expression.assertUpdateExpression();
        return this.#buildUpdateExpression(expression);
      // case "MemberExpression":
      //   expression.assertMemberExpression();
      //   return this.#buildMemberExpression(expression);
      case "NumericLiteral":
      case "StringLiteral":
      case "BooleanLiteral":
        return this.#buildLiteral(
          expression as NodePath<
            t.NumericLiteral | t.StringLiteral | t.BooleanLiteral
          >,
        );
      default:
        return this.#buildUnsupportedExpression(expression);
    }
  }

  #buildAssignmentExpression(
    expression: NodePath<t.AssignmentExpression>,
  ): Place {
    if (expression.isAssignmentExpression()) {
      const left = expression.get("left");
      if (left.isIdentifier()) {
        const name = left.node.name;

        // Get the existing declaration ID for the variable
        const declarationId = expression.scope.getData(name);

        // Build instruction to store the assignment value.
        const right = expression.get("right");
        const valuePlace = this.#buildExpression(right);
        const targetPlace = this.#environment.createPlace({
          declarationId,
        });

        const instructionId = makeInstructionId(this.#nextInstructionId++);
        const instruction = new StoreLocalInstruction(
          instructionId,
          targetPlace,
          valuePlace,
          "const",
        );
        this.#currentBlock.addInstruction(instruction);

        // Update the binding for the declaration id.
        this.#environment.setBinding(
          declarationId,
          this.#currentBlock.id,
          targetPlace,
        );

        // Rename the variable in the scope to target place.
        const targetName = targetPlace.identifier.name;
        expression.scope.rename(name, targetName);
        this.#copyDeclaration(expression.scope, name, targetName);
        return targetPlace;
      }
    }

    return this.#buildUnsupportedExpression(expression);
  }

  #buildCallExpression(expression: NodePath<t.CallExpression>): Place {
    const callee: NodePath<t.Expression | t.V8IntrinsicIdentifier> =
      expression.get("callee");
    callee.assertExpression();

    const calleeName = getExpressionName(callee);
    const calleeDeclarationId = calleeName
      ? expression.scope.getData(calleeName)
      : undefined;
    const calleePlace = this.#environment.createPlace({
      declarationId: calleeDeclarationId,
    });
    this.#currentBlock.addInstruction(
      new LoadLocalInstruction(
        makeInstructionId(this.#nextInstructionId++),
        calleePlace,
        this.#buildExpression(callee),
      ),
    );

    const args = expression.get("arguments");
    const argsPlaces = args.map((arg) => {
      if (arg.isIdentifier()) {
        return this.#buildIdentifier(arg);
      } else if (arg.isSpreadElement()) {
        return this.#buildSpreadElement(arg);
      }

      return this.#buildExpression(arg as NodePath<t.Expression>);
    });

    const resultPlace = this.#environment.createPlace();
    this.#currentBlock.addInstruction(
      new CallExpressionInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        calleePlace,
        argsPlaces,
      ),
    );

    return resultPlace;
  }

  #buildIdentifier(expression: NodePath<t.Identifier>): Place {
    const name = expression.node.name;

    // Get the binding for the identifier.
    const declarationId = expression.scope.getData(name);
    const place = resolveBinding(
      this.#environment.bindings,
      this.#blocks,
      declarationId,
      this.#currentBlock.id,
    );

    const resultPlace = this.#environment.createPlace();
    this.#currentBlock.addInstruction(
      new LoadLocalInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        place,
      ),
    );

    return resultPlace;
  }

  #buildArrayExpression(expression: NodePath<t.ArrayExpression>): Place {
    expression.assertArrayExpression();
    const resultPlace = this.#environment.createPlace();
    const elements = expression.get("elements");
    const elementsPlaces = elements.map((element) => {
      if (element.isSpreadElement()) {
        return this.#buildSpreadElement(element);
      }
      return this.#buildExpression(element as NodePath<t.Expression>);
    });

    this.#currentBlock.addInstruction(
      new ArrayExpressionInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        elementsPlaces,
      ),
    );

    return resultPlace;
  }

  #buildBinaryExpression(expression: NodePath<t.BinaryExpression>): Place {
    const leftPlace = this.#buildExpression(expression.get("left"));
    const rightPlace = this.#buildExpression(expression.get("right"));
    const resultPlace = this.#environment.createPlace();

    this.#currentBlock.addInstruction(
      new BinaryExpressionInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        expression.node.operator as "+",
        leftPlace,
        rightPlace,
      ),
    );

    return resultPlace;
  }

  #buildUnaryExpression(expression: NodePath<t.UnaryExpression>): Place {
    expression.assertUnaryExpression();
    const operandPlace = this.#buildExpression(
      expression.get("argument") as NodePath<t.Expression>,
    );
    const resultPlace = this.#environment.createPlace();

    this.#currentBlock.addInstruction(
      new UnaryExpressionInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        expression.node.operator as "!" | "~",
        operandPlace,
      ),
    );

    return resultPlace;
  }

  #buildUpdateExpression(expression: NodePath<t.UpdateExpression>): Place {
    expression.assertUpdateExpression();
    const argument = expression.get("argument");
    const argumentPlace = this.#buildExpression(argument);
    const resultPlace = this.#environment.createPlace();

    this.#currentBlock.addInstruction(
      new UpdateExpressionInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        expression.node.operator,
        expression.node.prefix,
        argumentPlace,
      ),
    );

    const name = getExpressionName(argument);
    if (name === null) {
      throw new Error("Unsupported update expression");
    }

    // Update the binding for the variable.
    const declarationId = expression.scope.getData(name);
    this.#environment.setBinding(
      declarationId,
      this.#currentBlock.id,
      resultPlace,
    );

    // Rename the variable in the scope.
    expression.scope.rename(name, resultPlace.identifier.name);
    this.#copyDeclaration(expression.scope, name, resultPlace.identifier.name);

    return resultPlace;
  }

  #buildLiteral(
    expression: NodePath<t.NumericLiteral | t.StringLiteral | t.BooleanLiteral>,
  ): Place {
    const resultPlace = this.#environment.createPlace();
    this.#currentBlock.addInstruction(
      new LiteralInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        expression.node.value,
      ),
    );
    return resultPlace;
  }

  #buildUnsupportedExpression(expression: NodePath): Place {
    const resultPlace = this.#environment.createPlace();
    this.#currentBlock.addInstruction(
      new UnsupportedNodeInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        expression.node,
      ),
    );
    return resultPlace;
  }

  #buildSpreadElement(expression: NodePath<t.SpreadElement>): Place {
    const argument = expression.get("argument");
    if (!argument) {
      throw new Error("Spread element has no argument");
    }

    const resultPlace = this.#environment.createPlace();
    const place = this.#buildExpression(argument);
    this.#currentBlock.addInstruction(
      new SpreadElementInstruction(
        makeInstructionId(this.#nextInstructionId++),
        resultPlace,
        place,
      ),
    );
    return resultPlace;
  }

  #copyDeclaration(scope: Scope, from: string, to: string) {
    let data;
    while (scope !== undefined && (data = scope.data[from]) === undefined) {
      scope = scope.parent;
    }

    if (scope === undefined) {
      throw new Error(`Could not find declaration for ${from}`);
    }

    scope.setData(to, data);
  }

  #resolveBlockTerminalChain(block: Block): Block {
    const terminal = block.terminal;
    if (terminal === null) {
      return block;
    }

    switch (terminal.kind) {
      case "if":
        return this.#resolveBlockTerminalChain(
          this.#blocks.get(terminal.fallthrough)!,
        );
      case "jump":
        return this.#resolveBlockTerminalChain(
          this.#blocks.get(terminal.target)!,
        );
      case "return":
        return block;
      case "while":
        return this.#resolveBlockTerminalChain(
          this.#blocks.get(terminal.exit)!,
        );
    }
  }
}

export function resolveBinding(
  bindings: Bindings,
  blocks: Map<BlockId, Block>,
  declarationId: DeclarationId,
  blockId: BlockId,
) {
  const declarationBindings = bindings.get(declarationId);
  if (declarationBindings === undefined) {
    throw new Error(`Undefined variable: ${declarationId}`);
  }

  const place = declarationBindings.get(blockId);
  if (place !== undefined) {
    return place;
  }

  const block = blocks.get(blockId);
  if (block === undefined) {
    throw new Error(`Undefined block: ${blockId}`);
  }

  if (block.parent === undefined) {
    throw new Error(`Undefined variable: ${declarationId}`);
  }

  return resolveBinding(bindings, blocks, declarationId, block.parent);
}
