import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, PatternInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * Represents an array pattern in the IR.
 *
 * Examples:
 * - `const [x, y] = [1, 2] // [x, y] is the array pattern`
 */
export declare class ArrayPatternInstruction extends PatternInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly elements: Place[];
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, elements: Place[]);
    clone(environment: Environment): ArrayPatternInstruction;
    rewrite(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
