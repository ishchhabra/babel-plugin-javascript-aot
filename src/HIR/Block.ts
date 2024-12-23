import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { ExpressionInstruction, Instruction } from "./Instruction";
import { Place } from "./Place";
import { Terminal } from "./Terminal";

export type BlockId = number;

export abstract class Block {
  id: BlockId;
  instructions: Instruction[];
  parent: BlockId | undefined;
  predecessors: Set<BlockId>;
  terminal: Terminal | null;

  constructor(
    id: BlockId,
    instructions: Instruction[],
    parent: BlockId | undefined,
    terminal: Terminal | null,
    predecessors: Set<BlockId>,
  ) {
    this.id = id;
    this.instructions = instructions;
    this.parent = parent;
    this.terminal = terminal;
    this.predecessors = predecessors;
  }

  addInstruction(instruction: Instruction) {
    this.instructions.push(instruction);
  }

  setTerminal(terminal: Terminal) {
    this.terminal = terminal;
  }

  addPredecessor(predecessor: BlockId) {
    this.predecessors.add(predecessor);
  }
}

export class BasicBlock extends Block {
  static empty(id: BlockId, parent: BlockId | undefined) {
    return new BasicBlock(id, [], parent, null, new Set());
  }

  constructor(
    id: BlockId,
    instructions: Instruction[],
    parent: BlockId | undefined,
    terminal: Terminal | null,
    predecessors: Set<BlockId>,
  ) {
    super(id, instructions, parent, terminal, predecessors);
  }
}

export class SequenceBlock extends Block {
  expressions: ExpressionInstruction[];

  static empty(id: BlockId, parent: BlockId | undefined) {
    return new SequenceBlock(id, [], parent, null, new Set());
  }

  addExpression(expression: ExpressionInstruction) {
    this.expressions.push(expression);
  }

  constructor(
    id: BlockId,
    instructions: Instruction[],
    parent: BlockId | undefined,
    terminal: Terminal | null,
    predecessors: Set<BlockId>,
  ) {
    super(id, instructions, parent, terminal, predecessors);
    this.expressions = [];
  }
}

export class ForLoopBlock extends Block {
  init: NodePath<t.ForStatement["init"]>;
  test: NodePath<t.ForStatement["test"]>;
  body: BasicBlock;
  update: NodePath<t.ForStatement["update"]>;
  instructions: Instruction[] = [];

  constructor(
    id: BlockId,
    init: NodePath<t.ForStatement["init"]>,
    test: NodePath<t.ForStatement["test"]>,
    body: BasicBlock,
    update: NodePath<t.ForStatement["update"]>,
    parent: BlockId | undefined,
    predecessors: Set<BlockId>,
  ) {
    super(id, [], parent, null, predecessors);
    this.init = init;
    this.test = test;
    this.body = body;
    this.update = update;
  }
}

export class LoopBlock extends Block {
  header: BasicBlock;
  test: Place;
  body: BasicBlock;

  constructor(
    id: BlockId,
    header: BasicBlock,
    body: BasicBlock,
    test: Place,
    parent: BlockId | undefined,
  ) {
    super(id, [], parent, null, new Set());
    this.header = header;
    this.body = body;
    this.test = test;
  }
}
