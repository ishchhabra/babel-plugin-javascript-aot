import { NodePath } from "@babel/core";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Place } from "../../core";
/**
 * Represents a hole - an empty or missing value in an array.
 *
 * Example:
 * [1, , 3] // Second element is a hole
 */
export declare class HoleInstruction extends ValueInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<null>;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<null>);
    rewriteInstruction(): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
