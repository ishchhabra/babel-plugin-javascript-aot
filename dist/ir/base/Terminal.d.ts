import { type Place } from "../core";
import { type InstructionId } from "./Instruction";
export declare abstract class BaseTerminal {
    readonly id: InstructionId;
    constructor(id: InstructionId);
    abstract getReadPlaces(): Place[];
}
