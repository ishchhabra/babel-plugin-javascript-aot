import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { InstructionId, MemoryInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * Represents a memory instruction that copies the value of one place to another.
 *
 * For example, Copy(lval: x, value: y) means that the value at place y is copied to x.
 */
export declare class CopyInstruction extends MemoryInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly lval: Place;
    readonly value: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, lval: Place, value: Place);
    rewriteInstruction(values: Map<Identifier, Place>): CopyInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
