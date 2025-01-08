import { BaseInstruction } from "./Instruction";
import { BaseTerminal } from "./Terminal";

/**
 * Simulated opaque type for BlockId to prevent using normal numbers as ids
 * accidentally.
 */
const opaqueBlockId = Symbol();
export type BlockId = number & { [opaqueBlockId]: "BlockId" };

export function makeBlockId(id: number): BlockId {
  return id as BlockId;
}

export class BasicBlock {
  constructor(
    public readonly id: BlockId,
    public instructions: BaseInstruction[],
    public terminal: BaseTerminal | undefined,
  ) {}
}
