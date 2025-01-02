import { BlockId } from "./Block";
import { InstructionId } from "./Instruction";
import { Place } from "./Place";

export class BaseTerminal {
  constructor(public readonly id: InstructionId) {}
}

export class BranchTerminal extends BaseTerminal {
  constructor(
    id: InstructionId,
    public readonly test: Place,
    public readonly consequent: BlockId,
    public readonly alternate: BlockId,
    /*
     * Ideally, the fallthrough block should be computed based on the
     * CFG. Currently, to simplify the implementation, we're just manually
     * including it during the IR construction. This makes the IR construction
     * more error-prone, but easier to implement.
     */
    public readonly fallthrough: BlockId
  ) {
    super(id);
  }
}

export class JumpTerminal extends BaseTerminal {
  constructor(id: InstructionId, public readonly target: BlockId) {
    super(id);
  }
}

export class ReturnTerminal extends BaseTerminal {
  constructor(id: InstructionId, public readonly value: Place) {
    super(id);
  }
}
