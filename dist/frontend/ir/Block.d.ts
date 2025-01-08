import { BaseInstruction } from "./Instruction";
import { BaseTerminal } from "./Terminal";
/**
 * Simulated opaque type for BlockId to prevent using normal numbers as ids
 * accidentally.
 */
declare const opaqueBlockId: unique symbol;
export type BlockId = number & {
    [opaqueBlockId]: "BlockId";
};
export declare function makeBlockId(id: number): BlockId;
export declare class BasicBlock {
    readonly id: BlockId;
    instructions: BaseInstruction[];
    terminal: BaseTerminal | undefined;
    constructor(id: BlockId, instructions: BaseInstruction[], terminal: BaseTerminal | undefined);
}
export {};
