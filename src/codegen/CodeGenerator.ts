import * as t from "@babel/types";
import {
  ArrayExpressionInstruction,
  BaseInstruction,
  BaseTerminal,
  BasicBlock,
  BinaryExpressionInstruction,
  BlockId,
  BranchTerminal,
  ExpressionInstruction,
  ExpressionStatementInstruction,
  HoleInstruction,
  JumpTerminal,
  LiteralInstruction,
  LoadLocalInstruction,
  makeBlockId,
  PlaceId,
  ReturnTerminal,
  StatementInstruction,
  StoreLocalInstruction,
  UnsupportedNodeInstruction,
} from "../ir";
import {
  CopyInstruction,
  FunctionDeclarationInstruction,
  MiscellaneousInstruction,
  SpreadElementInstruction,
  UnaryExpressionInstruction,
} from "../ir/Instruction";

/**
 * Generates the code from the IR.
 */
export class CodeGenerator {
  private readonly places: Map<PlaceId, t.Node | null> = new Map();
  private readonly blockToStatements: Map<BlockId, Array<t.Statement>> =
    new Map();
  private readonly generatedBlocks: Set<BlockId> = new Set();

  constructor(
    private readonly blocks: Map<BlockId, BasicBlock>,
    private readonly backEdges: Map<BlockId, Set<BlockId>>
  ) {}

  generate(): t.Program {
    const statements = this.#generateBlock(makeBlockId(0));
    return t.program(statements);
  }

  /******************************************************************************
   * Code Generation
   *
   * Methods for generating code from different IR components
   ******************************************************************************/

  #generateInstruction(instruction: BaseInstruction): Array<t.Statement> {
    const statements: Array<t.Statement> = [];

    if (instruction instanceof ExpressionInstruction) {
      this.#generateExpression(instruction);
    } else if (instruction instanceof StatementInstruction) {
      statements.push(this.#generateStatement(instruction));
    } else if (instruction instanceof MiscellaneousInstruction) {
      this.#generateMiscellaneousNode(instruction);
    } else if (instruction instanceof UnsupportedNodeInstruction) {
      const node = this.#generateUnsupportedNodeInstruction(instruction);
      if (t.isStatement(node)) {
        statements.push(node);
      }
    }

    return statements;
  }

  #generateUnsupportedNodeInstruction(
    instruction: UnsupportedNodeInstruction
  ): t.Node {
    const node = instruction.node;
    this.places.set(instruction.argumentPlace.id, node);
    return node;
  }

  /******************************************************************************
   * Block Generation
   *
   * Methods for generating code from different types of blocks
   ******************************************************************************/
  #generateBlock(blockId: BlockId): Array<t.Statement> {
    if (this.generatedBlocks.has(blockId)) {
      return [];
    }

    this.generatedBlocks.add(blockId);

    const block = this.blocks.get(blockId);
    if (block === undefined) {
      throw new Error(`Block ${blockId} not found`);
    }

    const statements = this.#generateBasicBlock(blockId);
    this.blockToStatements.set(blockId, statements);
    return statements;
  }

  #generateBasicBlock(blockId: BlockId): Array<t.Statement> {
    const block = this.blocks.get(blockId);
    if (block === undefined) {
      throw new Error(`Block ${blockId} not found`);
    }

    const statements: Array<t.Statement> = [];
    for (const instruction of block.instructions) {
      statements.push(...this.#generateInstruction(instruction));
    }

    const backEdges = this.backEdges.get(blockId)!;
    if (backEdges.size > 1) {
      throw new Error(`Block ${blockId} has multiple back edges`);
    }

    if (backEdges.size > 0) {
      return this.#generateBackEdge(blockId);
    }

    const terminal = block.terminal;
    if (terminal !== undefined) {
      statements.push(...this.#generateTerminal(terminal));
    }

    this.blockToStatements.set(blockId, statements);
    return statements;
  }

  #generateBackEdge(blockId: BlockId): Array<t.Statement> {
    const terminal = this.blocks.get(blockId)!.terminal!;
    if (!(terminal instanceof BranchTerminal)) {
      throw new Error(
        `Unsupported back edge from ${blockId} to ${blockId} (${terminal.constructor.name})`
      );
    }

    const test = this.places.get(terminal.test.id);
    if (test === undefined) {
      throw new Error(`Place ${terminal.test.id} not found`);
    }

    t.assertExpression(test);

    const bodyInstructions = this.#generateBasicBlock(terminal.consequent);
    // NOTE: No need to generate the consequent block, because in a while loop,
    // the same as the fallthrough block.
    const exitInstructions = this.#generateBasicBlock(terminal.fallthrough);

    const node = t.whileStatement(test, t.blockStatement(bodyInstructions));
    return [node, ...exitInstructions];
  }

  /******************************************************************************
   * Terminal Generation
   *
   * Methods for generating code from different types of block terminals
   ******************************************************************************/
  #generateTerminal(terminal: BaseTerminal): Array<t.Statement> {
    if (terminal instanceof BranchTerminal) {
      return this.#generateBranchTerminal(terminal);
    } else if (terminal instanceof JumpTerminal) {
      return this.#generateJumpTerminal(terminal);
    } else if (terminal instanceof ReturnTerminal) {
      return this.#generateReturnTerminal(terminal);
    }

    throw new Error(`Unsupported terminal type: ${terminal.constructor.name}`);
  }

  #generateBranchTerminal(terminal: BranchTerminal): Array<t.Statement> {
    // Generate the fallthrough block first so that we do not rebuild it
    // if the alternate block is the same as the fallthrough block.
    const fallthrough = this.#generateBlock(terminal.fallthrough);

    const test = this.places.get(terminal.test.id);
    if (test === undefined) {
      throw new Error(`Place ${terminal.test.id} not found`);
    }

    t.assertExpression(test);

    const consequent = this.#generateBlock(terminal.consequent);
    let alternate;
    if (terminal.alternate !== terminal.fallthrough) {
      alternate = this.#generateBlock(terminal.alternate);
    }

    const node = t.ifStatement(
      test,
      t.blockStatement(consequent),
      alternate ? t.blockStatement(alternate) : null
    );

    const statements = [node, ...fallthrough];
    return statements;
  }

  #generateJumpTerminal(terminal: JumpTerminal): Array<t.Statement> {
    const target = this.#generateBlock(terminal.target);
    return target;
  }

  #generateReturnTerminal(terminal: ReturnTerminal): Array<t.Statement> {
    const value = this.places.get(terminal.value.id);
    if (value === undefined) {
      throw new Error(`Place ${terminal.value.id} not found`);
    }

    t.assertExpression(value);
    return [t.returnStatement(value)];
  }

  /******************************************************************************
   * Expression Generation
   *
   * Methods for generating code from different types of expressions
   ******************************************************************************/
  #generateExpression(instruction: ExpressionInstruction): t.Expression | null {
    if (instruction instanceof ArrayExpressionInstruction) {
      return this.#generateArrayExpression(instruction);
    } else if (instruction instanceof BinaryExpressionInstruction) {
      return this.#generateBinaryExpression(instruction);
    } else if (instruction instanceof CopyInstruction) {
      return this.#generateCopyInstruction(instruction);
    } else if (instruction instanceof LiteralInstruction) {
      return this.#generateLiteralExpression(instruction);
    } else if (instruction instanceof LoadLocalInstruction) {
      return this.#generateLoadLocalInstruction(instruction);
    } else if (instruction instanceof UnaryExpressionInstruction) {
      return this.#generateUnaryExpression(instruction);
    }

    throw new Error(
      `Unsupported expression type: ${instruction.constructor.name}`
    );
  }

  #generateArrayExpression(
    instruction: ArrayExpressionInstruction
  ): t.Expression {
    const elements = instruction.elements.map((element) => {
      const node = this.places.get(element.id);
      if (node === undefined) {
        throw new Error(`Place ${element.id} not found`);
      }

      if (node === null || t.isSpreadElement(node)) {
        return node;
      }

      t.assertExpression(node);
      return node;
    });

    const node = t.arrayExpression(elements);
    this.places.set(instruction.argumentPlace.id, node);
    return node;
  }

  #generateBinaryExpression(
    instruction: BinaryExpressionInstruction
  ): t.Expression {
    const left = this.places.get(instruction.left.id);
    if (left === undefined) {
      throw new Error(`Place ${instruction.left.id} not found`);
    }

    const right = this.places.get(instruction.right.id);
    if (right === undefined) {
      throw new Error(`Place ${instruction.right.id} not found`);
    }

    t.assertExpression(left);
    t.assertExpression(right);

    const node = t.binaryExpression(instruction.operator, left, right);
    this.places.set(instruction.argumentPlace.id, node);
    return node;
  }

  #generateCopyInstruction(instruction: CopyInstruction): t.Expression {
    const lval = t.identifier(instruction.lval.identifier.name);
    const value = this.places.get(instruction.value.id);
    if (value === undefined) {
      throw new Error(`Place ${instruction.value.id} not found`);
    }

    t.assertExpression(value);

    const node = t.assignmentExpression("=", lval, value);
    this.places.set(instruction.argumentPlace.id, node);
    return node;
  }

  #generateLiteralExpression(instruction: LiteralInstruction): t.Expression {
    const node = t.valueToNode(instruction.value);
    this.places.set(instruction.argumentPlace.id, node);
    return node;
  }

  #generateLoadLocalInstruction(
    instruction: LoadLocalInstruction
  ): t.Expression {
    const node = t.identifier(instruction.target.identifier.name);
    this.places.set(instruction.argumentPlace.id, node);
    return node;
  }

  #generateUnaryExpression(
    instruction: UnaryExpressionInstruction
  ): t.Expression {
    const argument = this.places.get(instruction.argument.id);
    if (argument === undefined) {
      throw new Error(`Place ${instruction.argument.id} not found`);
    }

    t.assertExpression(argument);
    const node = t.unaryExpression(instruction.operator, argument);
    this.places.set(instruction.argumentPlace.id, node);
    return node;
  }

  /******************************************************************************
   * Statement Generation
   *
   * Methods for generating code from different types of statements
   ******************************************************************************/
  #generateStatement(instruction: StatementInstruction): t.Statement {
    if (instruction instanceof ExpressionStatementInstruction) {
      return this.#generateExpressionStatement(instruction);
    } else if (instruction instanceof FunctionDeclarationInstruction) {
      return this.#generateFunctionDeclaration(instruction);
    } else if (instruction instanceof StoreLocalInstruction) {
      return this.#generateStoreLocalInstruction(instruction);
    }

    throw new Error(
      `Unsupported statement type: ${instruction.constructor.name}`
    );
  }

  #generateExpressionStatement(
    instruction: ExpressionStatementInstruction
  ): t.Statement {
    const expression = this.places.get(instruction.expression.id);
    if (expression === undefined) {
      throw new Error(`Place ${instruction.expression.id} not found`);
    }

    t.assertExpression(expression);
    const node = t.expressionStatement(expression);
    this.places.set(instruction.argumentPlace.id, node);
    return node;
  }

  #generateFunctionDeclaration(
    instruction: FunctionDeclarationInstruction
  ): t.Statement {
    // Since this is the first time we're using param, it does not exist in the
    // places map. We need to create a new identifier for it.
    const paramNodes = instruction.params.map((param) => {
      const identifier = t.identifier(param.identifier.name);
      this.places.set(param.id, identifier);
      return identifier;
    });

    // Since this is the first time we're using the function name, it does not
    // exist in the places map. We need to create a new identifier for it.
    const idNode = t.identifier(instruction.argumentPlace.identifier.name);
    this.places.set(instruction.argumentPlace.id, idNode);

    const body = this.#generateBlock(instruction.body);
    const node = t.functionDeclaration(
      idNode,
      paramNodes,
      t.blockStatement(body)
    );
    this.places.set(instruction.argumentPlace.id, node);
    return node;
  }

  #generateStoreLocalInstruction(
    instruction: StoreLocalInstruction
  ): t.Statement {
    // Since this is the first time we're using lval, it does not exist in the
    // places map. We need to create a new identifier for it.
    const lval = t.identifier(instruction.lval.identifier.name);
    this.places.set(instruction.lval.id, lval);

    const value = this.places.get(instruction.value.id);
    if (value === undefined) {
      throw new Error(`Place ${instruction.value.id} not found`);
    }

    t.assertLVal(lval);
    t.assertExpression(value);

    const node = t.variableDeclaration(instruction.type, [
      t.variableDeclarator(lval, value),
    ]);
    this.places.set(instruction.argumentPlace.id, node);
    return node;
  }

  /******************************************************************************
   * Misc Node Generation
   *
   * Methods for generating code from miscellaneous node types like holes and spread
   ******************************************************************************/

  #generateMiscellaneousNode(
    instruction: MiscellaneousInstruction
  ): t.SpreadElement | null {
    if (instruction instanceof HoleInstruction) {
      return this.#generateHole(instruction);
    } else if (instruction instanceof SpreadElementInstruction) {
      return this.#generateSpreadElement(instruction);
    }

    throw new Error(
      `Unsupported miscellaneous node type: ${instruction.constructor.name}`
    );
  }

  #generateHole(instruction: HoleInstruction): null {
    const node = null;
    this.places.set(instruction.argumentPlace.id, node);
    return node;
  }

  #generateSpreadElement(
    instruction: SpreadElementInstruction
  ): t.SpreadElement {
    const argument = this.places.get(instruction.argument.id);
    if (argument === undefined) {
      throw new Error(`Place ${instruction.argument.id} not found`);
    }

    t.assertExpression(argument);
    const node = t.spreadElement(argument);
    this.places.set(instruction.argumentPlace.id, node);
    return node;
  }
}
