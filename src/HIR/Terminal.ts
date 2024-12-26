import { BlockId } from "./Block";
import { InstructionId } from "./Instruction";
import { Place } from "./Place";

export class BaseTerminal {
  id: InstructionId;

  constructor(id: InstructionId) {
    this.id = id;
  }
}

export class ForLoopTerminal extends BaseTerminal {
  init: BlockId | undefined;
  test: BlockId | undefined;
  update: BlockId | undefined;
  body: BlockId;
  exit: BlockId;

  constructor(
    id: InstructionId,
    init: BlockId | undefined,
    test: BlockId | undefined,
    update: BlockId | undefined,
    body: BlockId,
    exit: BlockId,
  ) {
    super(id);
    this.init = init;
    this.test = test;
    this.update = update;
    this.body = body;
    this.exit = exit;
  }
}

export class IfTerminal extends BaseTerminal {
  test: Place;
  consequent: BlockId;
  alternate: BlockId | undefined;
  fallthrough: BlockId;

  constructor(
    id: InstructionId,
    test: Place,
    consequent: BlockId,
    alternate: BlockId | undefined,
    fallthrough: BlockId,
  ) {
    super(id);
    this.test = test;
    this.consequent = consequent;
    this.alternate = alternate;
    this.fallthrough = fallthrough;
  }
}

export class JumpTerminal extends BaseTerminal {
  target: BlockId;
  fallthrough: BlockId;

  constructor(id: InstructionId, target: BlockId, fallthrough: BlockId) {
    super(id);
    this.target = target;
    this.fallthrough = fallthrough;
  }
}

export class ReturnTerminal extends BaseTerminal {
  value: Place;

  constructor(id: InstructionId, value: Place) {
    super(id);
    this.value = value;
  }
}

export class WhileLoopTerminal extends BaseTerminal {
  test: BlockId;
  body: BlockId;
  exit: BlockId;

  constructor(id: InstructionId, test: BlockId, body: BlockId, exit: BlockId) {
    super(id);
    this.test = test;
    this.body = body;
    this.exit = exit;
  }
}

export type Terminal =
  | ForLoopTerminal
  | IfTerminal
  | JumpTerminal
  | ReturnTerminal
  | WhileLoopTerminal;
