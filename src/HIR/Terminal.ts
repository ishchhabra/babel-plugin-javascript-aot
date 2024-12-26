import { BlockId } from "./Block";
import { InstructionId } from "./Instruction";
import { Place } from "./Place";

export type IfTerminal = {
  kind: "if";
  id: InstructionId;
  test: Place;
  consequent: BlockId;
  alternate: BlockId | undefined;
  fallthrough: BlockId;
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

export interface WhileLoopTerminal {
  kind: "while";
  id: InstructionId;
  test: BlockId;
  body: BlockId;
  exit: BlockId;
}

export type Terminal =
  | IfTerminal
  | JumpTerminal
  | ReturnTerminal
  | WhileLoopTerminal;
