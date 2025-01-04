import { BlockId } from "./Block";
import { InstructionId } from "./Instruction";
import { Place } from "./Place";
export declare abstract class BaseTerminal {
    readonly id: InstructionId;
    constructor(id: InstructionId);
    abstract getReadPlaces(): Place[];
}
export declare class BranchTerminal extends BaseTerminal {
    readonly test: Place;
    readonly consequent: BlockId;
    readonly alternate: BlockId;
    readonly fallthrough: BlockId;
    constructor(id: InstructionId, test: Place, consequent: BlockId, alternate: BlockId, fallthrough: BlockId);
    getReadPlaces(): Place[];
}
export declare class JumpTerminal extends BaseTerminal {
    readonly target: BlockId;
    constructor(id: InstructionId, target: BlockId);
    getReadPlaces(): Place[];
}
export declare class ReturnTerminal extends BaseTerminal {
    readonly value: Place;
    constructor(id: InstructionId, value: Place);
    getReadPlaces(): Place[];
}
