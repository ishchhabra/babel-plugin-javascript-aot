import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId } from "../base";
import { Identifier, Place } from "../core";
/**
 * Represents a spread element in the IR.
 *
 * Examples:
 * - `...foo`
 * - `...[1, 2, 3]`
 */
export declare class SpreadElementInstruction extends BaseInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly argument: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, argument: Place);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
