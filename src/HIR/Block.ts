import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { ExpressionInstruction, Instruction } from "./Instruction";
import { Phi } from "./Phi";
import { Terminal } from "./Terminal";

export type BlockId = number;

export abstract class Block {
  id: BlockId;
  instructions: Instruction[];
  parent: BlockId | undefined;
  phis: Set<Phi>;
  terminal: Terminal | null;

  constructor(
    id: BlockId,
    instructions: Instruction[],
    parent: BlockId | undefined,
    phis: Set<Phi>,
    terminal: Terminal | null,
  ) {
    this.id = id;
    this.instructions = instructions;
    this.parent = parent;
    this.phis = phis;
    this.terminal = terminal;
  }

  addInstruction(instruction: Instruction) {
    this.instructions.push(instruction);
  }

  setTerminal(terminal: Terminal) {
    this.terminal = terminal;
  }
}

export class BasicBlock extends Block {
  static empty(id: BlockId, parent: BlockId | undefined) {
    return new BasicBlock(id, [], parent, new Set(), null);
  }

  constructor(
    id: BlockId,
    instructions: Instruction[],
    parent: BlockId | undefined,
    phis: Set<Phi>,
    terminal: Terminal | null,
  ) {
    super(id, instructions, parent, phis, terminal);
  }
}

export class SequenceBlock extends Block {
  expressions: ExpressionInstruction[];

  static empty(id: BlockId, parent: BlockId | undefined) {
    return new SequenceBlock(id, [], parent, new Set(), null);
  }

  addExpression(expression: ExpressionInstruction) {
    this.expressions.push(expression);
  }

  constructor(
    id: BlockId,
    instructions: Instruction[],
    parent: BlockId | undefined,
    phis: Set<Phi>,
    terminal: Terminal | null,
  ) {
    super(id, instructions, parent, phis, terminal);
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
  ) {
    super(id, [], parent, new Set(), null);
    this.init = init;
    this.test = test;
    this.body = body;
    this.update = update;
  }
}
