import { BlockId } from "./Block";
import { InstructionId } from "./Instruction";
import { Place } from "./Place";

export type IfTerminal = {
  kind: "if";
  test: Place;
  consequent: BlockId;
  alternate: BlockId | undefined;
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

export type Terminal = IfTerminal | JumpTerminal | ReturnTerminal;
