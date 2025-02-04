import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * Represents an object property in the IR.
 *
 * Examples:
 * - `{ x: 1, y: 2 } // `x: 1` and `y: 2` are the object properties
 */
export declare class ObjectPropertyInstruction extends ValueInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly key: Place;
    readonly value: Place;
    readonly computed: boolean;
    readonly shorthand: boolean;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, key: Place, value: Place, computed: boolean, shorthand: boolean);
    clone(environment: Environment): ObjectPropertyInstruction;
    rewrite(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
}
