import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { InstructionId, MemoryInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * An instruction that stores a value into a **static** property for an object:
 * `object[0]` or `object.foo`.
 */
export declare class StorePropertyInstruction extends MemoryInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly object: Place;
    readonly property: string;
    readonly value: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, object: Place, property: string, value: Place);
    clone(environment: Environment): StorePropertyInstruction;
    rewriteInstruction(values: Map<Identifier, Place>): StorePropertyInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
