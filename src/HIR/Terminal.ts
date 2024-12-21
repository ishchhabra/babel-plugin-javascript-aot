import { BlockId } from "./Block";
import { InstructionId } from "./Instruction";
import { Place } from "./Place";

export type BranchTerminal = {
  kind: "branch";
  test: Place;
  consequent: BlockId;
  alternate: BlockId;
  fallthrough: BlockId;
  id: InstructionId;
};

export type JumpTerminal = {
  kind: "jump";
  id: InstructionId;
  target: BlockId;
  fallthrough: BlockId;
};

export type ReturnTerminal = {
  kind: "return";
  id: InstructionId;
  value: Place;
};

export type Terminal = BranchTerminal | JumpTerminal | ReturnTerminal;
