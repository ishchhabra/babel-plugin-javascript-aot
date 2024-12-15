import { BlockId } from "./Block";
import { InstructionId } from "./Instruction";
import { Place } from "./Place";

export type UnsupportedTerminal = {
  kind: "unsupported";
};

export type BranchTerminal = {
  kind: "branch";
  test: Place;
  consequent: BlockId;
  alternate: BlockId;
  fallthrough: BlockId;
  id: InstructionId;
};

export type ReturnTerminal = {
  kind: "return";
  id: InstructionId;
  value: Place;
};

export type Terminal = UnsupportedTerminal | ReturnTerminal | BranchTerminal;
