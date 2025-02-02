import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { InstructionId, MemoryInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * An instruction that stores a value into a **dynamic** property for an object:
 * `object[property]`.
 */
export declare class StoreDynamicPropertyInstruction extends MemoryInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly object: Place;
    readonly property: Place;
    readonly value: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, object: Place, property: Place, value: Place);
    clone(environment: Environment): StoreDynamicPropertyInstruction;
    rewrite(values: Map<Identifier, Place>): StoreDynamicPropertyInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
