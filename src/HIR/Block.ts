import { Instruction } from "./Instruction";
import { Terminal } from "./Terminal";

export type BlockId = number;

export type BlockKind = "block";

export type BasicBlock = {
  kind: BlockKind;
  id: BlockId;
  instructions: Instruction[];
  terminal: Terminal;
};
