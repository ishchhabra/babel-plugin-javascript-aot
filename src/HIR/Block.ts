import { Instruction } from "./Instruction";
import { Phi } from "./Phi";
import { Terminal } from "./Terminal";

export type BlockId = number;

export type BlockKind = "block";

export type BasicBlock = {
  kind: BlockKind;
  id: BlockId;
  instructions: Instruction[];
  phis: Set<Phi>;
  terminal: Terminal;
};

export function makeBlockId(id: number): BlockId {
  return id;
}

export function makeEmptyBlock(id: BlockId): BasicBlock {
  return {
    kind: "block",
    id,
    instructions: [],
    phis: new Set(),
    terminal: { kind: "unsupported" },
  };
}
