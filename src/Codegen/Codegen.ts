import * as t from "@babel/types";
import {
  ArrayExpressionInstruction,
  AssignmentExpressionInstruction,
  BasicBlock,
  BinaryExpressionInstruction,
  Block,
  BlockId,
  CallExpressionInstruction,
  ExpressionStatementInstruction,
  ForLoopTerminal,
  FunctionDeclarationInstruction,
  IdentifierId,
  IfTerminal,
  Instruction,
  JumpTerminal,
  LiteralInstruction,
  LoadLocalInstruction,
  ReturnTerminal,
  SpreadElementInstruction,
  StoreLocalInstruction,
  Terminal,
  UnaryExpressionInstruction,
  UnsupportedNodeInstruction,
  WhileLoopTerminal,
} from "../HIR";

export class Codegen {
  readonly #blocks: Map<BlockId, Block>;

  readonly #places: Map<IdentifierId, t.Node> = new Map();

  constructor(blocks: Map<BlockId, Block>) {
    this.#blocks = blocks;
  }

  generate(): t.Program {
    const body = this.#generateBlock(0);
    return t.program(body);
  }

  #generateBlock(blockId: BlockId): Array<t.Statement> {
    const statements: Array<t.Statement> = [];

    const block = this.#blocks.get(blockId);
    if (block === undefined) {
      throw new Error(`Block ${blockId} not found`);
    }

    if (block instanceof BasicBlock) {
      return this.#generateBasicBlock(block);
    }

    return statements;
  }

  #generateBasicBlock(block: BasicBlock): Array<t.Statement> {
    const statements: Array<t.Statement> = [];
    for (const instruction of block.instructions) {
      statements.push(...this.#generateInstruction(instruction));
    }

    if (block.terminal !== null) {
      statements.push(...this.#generateTerminal(block.terminal));
    }

    return statements;
  }

  #generateInstruction(instruction: Instruction): Array<t.Statement> {
    const statements: Array<t.Statement> = [];

    switch (instruction.kind) {
      case "ArrayExpression": {
        this.#generateArrayExpressionInstruction(instruction);
        break;
      }
      case "AssignmentExpression": {
        this.#generateAssignmentExpressionInstruction(instruction);
        break;
      }
      case "BinaryExpression": {
        this.#generateBinaryExpressionInstruction(instruction);
        break;
      }
      case "CallExpression": {
        this.#generateCallExpressionInstruction(instruction);
        break;
      }
      case "ExpressionStatement": {
        const node = this.#generateExpressionStatementInstruction(instruction);
        if (node !== undefined) {
          statements.push(node);
        }
        break;
      }
      case "FunctionDeclaration": {
        const node = this.#generateFunctionDeclarationInstruction(instruction);
        statements.push(node);
        break;
      }
      case "Literal": {
        this.#generateLiteralInstruction(instruction);
        break;
      }
      case "LoadLocal": {
        this.#generateLoadLocalInstruction(instruction);
        break;
      }
      case "SpreadElement": {
        this.#generateSpreadElementInstruction(instruction);
        break;
      }
      case "StoreLocal": {
        const node = this.#generateStoreLocalInstruction(instruction);
        statements.push(node);
        break;
      }
      case "UnaryExpression": {
        this.#generateUnaryExpressionInstruction(instruction);
        break;
      }
      case "UnsupportedNode": {
        const node = this.#generateUnsupportedNodeInstruction(instruction);
        if (t.isStatement(node)) {
          statements.push(node);
        }
        break;
      }
      default: {
        throw new Error(`Unknown instruction: ${instruction.kind}`);
      }
    }

    return statements;
  }

  // #################### Instructions ####################
  #generateArrayExpressionInstruction(instruction: ArrayExpressionInstruction) {
    const elements = instruction.elements.map((element) => {
      const node = this.#places.get(element.identifier.id);
      if (node === undefined) {
        throw new Error(`Place not found: ${element.identifier.id}`);
      }

      if (!t.isExpression(node) && !t.isSpreadElement(node)) {
        throw new Error(`Invalid element: ${element.identifier.id}`);
      }

      return node;
    });

    const node = t.arrayExpression(elements);
    this.#places.set(instruction.target.identifier.id, node);
    return node;
  }

  #generateAssignmentExpressionInstruction(
    instruction: AssignmentExpressionInstruction,
  ) {
    const left = t.identifier(instruction.left.identifier.name);

    const right = this.#places.get(instruction.right.identifier.id);
    if (right === undefined) {
      throw new Error(`Place not found: ${instruction.right.identifier.id}`);
    }

    t.assertLVal(left);
    t.assertExpression(right);

    const node = t.assignmentExpression("=", left, right);
    this.#places.set(instruction.target.identifier.id, node);
    return node;
  }

  #generateBinaryExpressionInstruction(
    instruction: BinaryExpressionInstruction,
  ) {
    const left = this.#places.get(instruction.left.identifier.id);
    const right = this.#places.get(instruction.right.identifier.id);

    if (left === undefined || right === undefined) {
      throw new Error(`Place not found: ${instruction.left.identifier.id}`);
    }

    t.assertExpression(left);
    t.assertExpression(right);

    const node = t.binaryExpression(instruction.operator, left, right);
    this.#places.set(instruction.target.identifier.id, node);
    return node;
  }

  #generateCallExpressionInstruction(instruction: CallExpressionInstruction) {
    const callee = this.#places.get(instruction.callee.identifier.id);
    if (callee === undefined) {
      throw new Error(`Place not found: ${instruction.callee.identifier.id}`);
    }

    const args = instruction.args.map((arg) => {
      const argNode = this.#places.get(arg.identifier.id);
      if (argNode === undefined) {
        throw new Error(`Place not found: ${arg.identifier.id}`);
      }

      return argNode;
    });

    t.assertExpression(callee);

    const node = t.callExpression(callee, args as t.Expression[]);
    this.#places.set(instruction.target.identifier.id, node);

    return node;
  }

  #generateExpressionStatementInstruction(
    instruction: ExpressionStatementInstruction,
  ) {
    const expression = this.#places.get(instruction.expression.identifier.id);
    if (expression === undefined) {
      throw new Error(
        `Place not found: ${instruction.expression.identifier.id}`,
      );
    }

    if (t.isExpression(expression)) {
      const node = t.expressionStatement(expression);
      this.#places.set(instruction.target.identifier.id, node);
      return node;
    }

    return undefined;
  }

  #generateFunctionDeclarationInstruction(
    instruction: FunctionDeclarationInstruction,
  ) {
    const params = instruction.params.map((param) =>
      t.identifier(param.identifier.name),
    );
    const bodyStatements = this.#generateBlock(instruction.body);

    const node = t.functionDeclaration(
      t.identifier(instruction.target.identifier.name),
      params,
      t.blockStatement(bodyStatements),
    );
    this.#places.set(instruction.target.identifier.id, node);
    return node;
  }

  #generateLiteralInstruction(instruction: LiteralInstruction) {
    const node = t.valueToNode(instruction.value);
    this.#places.set(instruction.target.identifier.id, node);
    return node;
  }

  #generateLoadLocalInstruction(instruction: LoadLocalInstruction) {
    const existingNode = this.#places.get(instruction.value.identifier.id);
    if (t.isExpression(existingNode)) {
      this.#places.set(instruction.target.identifier.id, existingNode);
      return existingNode;
    }

    const newNode = t.identifier(instruction.value.identifier.name);
    this.#places.set(instruction.target.identifier.id, newNode);
    return newNode;
  }

  #generateSpreadElementInstruction(instruction: SpreadElementInstruction) {
    const value = this.#places.get(instruction.value.identifier.id);
    if (value === undefined) {
      throw new Error(`Place not found: ${instruction.value.identifier.id}`);
    }

    t.assertExpression(value);

    const node = t.spreadElement(value);
    this.#places.set(instruction.target.identifier.id, node);
    return node;
  }

  #generateStoreLocalInstruction(instruction: StoreLocalInstruction) {
    const value = this.#places.get(instruction.value.identifier.id);

    const node = t.variableDeclaration(instruction.type, [
      t.variableDeclarator(
        t.identifier(instruction.target.identifier.name),
        value as t.Expression,
      ),
    ]);
    this.#places.set(instruction.target.identifier.id, node);

    return node;
  }

  #generateUnaryExpressionInstruction(instruction: UnaryExpressionInstruction) {
    const operand = this.#places.get(instruction.value.identifier.id);
    if (!operand) {
      throw new Error(`Place not found: ${instruction.value.identifier.id}`);
    }

    t.assertExpression(operand);

    const node = t.unaryExpression(instruction.operator, operand);
    this.#places.set(instruction.target.identifier.id, node);
    return node;
  }

  #generateUnsupportedNodeInstruction(instruction: UnsupportedNodeInstruction) {
    const node = instruction.node;
    this.#places.set(instruction.target.identifier.id, node);
    return node;
  }

  // #################### Terminals ####################
  #generateTerminal(terminal: Terminal): Array<t.Statement> {
    if (terminal instanceof ForLoopTerminal) {
      return this.#generateForLoopTerminal(terminal);
    }

    if (terminal instanceof IfTerminal) {
      return this.#generateIfTerminal(terminal);
    }
    if (terminal instanceof JumpTerminal) {
      return this.#generateJumpTerminal(terminal);
    }
    if (terminal instanceof ReturnTerminal) {
      return this.#generateReturnTerminal(terminal);
    }
    if (terminal instanceof WhileLoopTerminal) {
      return this.#generateWhileLoopTerminal(terminal);
    }

    throw new Error(`Unsupported terminal: ${terminal}`);
  }

  #generateForLoopTerminal(terminal: ForLoopTerminal): Array<t.Statement> {
    // TODO: Annotate places that are part of the input code rather than trying to
    // infer that based on on the expression type and the place where the code
    // is generated.
    const init = terminal.init;
    let initExpression: t.VariableDeclaration | t.Expression | undefined;
    if (init !== undefined) {
      this.#generateBlock(init);
      const initBlock = this.#blocks.get(init);
      const lastInstruction = initBlock?.instructions.pop();
      const initNode = this.#places.get(lastInstruction!.target.identifier.id);

      if (
        !t.isVariableDeclaration(initNode) &&
        !t.isExpression(initNode) &&
        !t.isExpressionStatement(initNode)
      ) {
        throw new Error(
          "Expected the last init block statement to be an variable declaration or expression",
        );
      }
      if (t.isExpressionStatement(initNode)) {
        initExpression = initNode.expression;
      } else {
        initExpression = initNode;
      }
    }

    const test = terminal.test;
    let testExpression: t.Expression | undefined;
    if (test !== undefined) {
      this.#generateBlock(test);
      const testBlock = this.#blocks.get(test);
      const testNode = this.#places.get(
        testBlock!.instructions.pop()!.target.identifier.id,
      );
      if (!t.isExpression(testNode)) {
        throw new Error(
          "Expected the last test block statement to be an expression statement",
        );
      }
      testExpression = testNode;
    }

    const update = terminal.update;
    let updateExpression: t.Expression | undefined;
    if (update !== undefined) {
      this.#generateBlock(update);
      const updateBlock = this.#blocks.get(update);
      const updateNode = this.#places.get(
        updateBlock!.instructions.pop()!.target.identifier.id,
      );
      if (!t.isExpression(updateNode) && !t.isExpressionStatement(updateNode)) {
        throw new Error(
          "Expected the last update block statement to be an expression statement",
        );
      }
      if (t.isExpressionStatement(updateNode)) {
        updateExpression = updateNode.expression;
      } else {
        updateExpression = updateNode;
      }
    }

    const bodyStatements = this.#generateBlock(terminal.body);

    const node = t.forStatement(
      initExpression,
      testExpression,
      updateExpression,
      t.blockStatement(bodyStatements),
    );
    return [node, ...this.#generateBlock(terminal.exit)];
  }

  #generateIfTerminal(terminal: IfTerminal): Array<t.Statement> {
    const test = this.#places.get(terminal.test.identifier.id);
    if (test === undefined) {
      throw new Error(`Place not found: ${terminal.test.identifier.id}`);
    }

    t.assertExpression(test);

    const consequent = this.#generateBlock(terminal.consequent);
    const alternate = terminal.alternate
      ? this.#generateBlock(terminal.alternate)
      : undefined;

    const node = t.ifStatement(
      test,
      t.blockStatement(consequent),
      alternate ? t.blockStatement(alternate) : null,
    );
    this.#places.set(terminal.test.identifier.id, node);

    const statements = [node, ...this.#generateBlock(terminal.fallthrough)];
    return statements;
  }

  #generateJumpTerminal(terminal: JumpTerminal): Array<t.Statement> {
    const target = this.#generateBlock(terminal.target);
    const fallthrough = this.#generateBlock(terminal.fallthrough);
    return [...target, ...fallthrough];
  }

  #generateReturnTerminal(terminal: ReturnTerminal): Array<t.Statement> {
    const value = this.#places.get(terminal.value.identifier.id);
    if (value === undefined) {
      throw new Error(`Place not found: ${terminal.value.identifier.id}`);
    }

    t.assertExpression(value);
    return [t.returnStatement(value)];
  }

  #generateWhileLoopTerminal(terminal: WhileLoopTerminal): Array<t.Statement> {
    // TODO: Annotate places that are part of the input code rather than trying to
    // infer that based on on the expression type and the place where the code
    // is generated.
    this.#generateBlock(terminal.test);
    const testBlock = this.#blocks.get(terminal.test);
    const testExpression = this.#places.get(
      testBlock!.instructions.pop()!.target.identifier.id,
    );
    if (!t.isExpression(testExpression)) {
      throw new Error(
        "Expected the last test block statement to be an expression statement",
      );
    }

    const bodyStatements = this.#generateBlock(terminal.body);

    const node = t.whileStatement(
      testExpression,
      t.blockStatement(bodyStatements),
    );
    const statements = [node, ...this.#generateBlock(terminal.exit)];
    return statements;
  }
}
