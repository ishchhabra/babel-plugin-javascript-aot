import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { InstructionId, MemoryInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * An instruction that loads a **dynamic** property for an object:
 * `object[property]`.
 */
export declare class LoadDynamicPropertyInstruction extends MemoryInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly object: Place;
    readonly property: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, object: Place, property: Place);
    clone(environment: Environment): LoadDynamicPropertyInstruction;
    rewrite(values: Map<Identifier, Place>): LoadDynamicPropertyInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
