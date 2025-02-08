import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { InstructionId, MemoryInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * An instruction that loads a **static** property for an object:
 * `object[0]` or `object.foo`.
 */
export declare class LoadStaticPropertyInstruction extends MemoryInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly object: Place;
    readonly property: string;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, object: Place, property: string);
    clone(environment: Environment): LoadStaticPropertyInstruction;
    rewrite(values: Map<Identifier, Place>): LoadStaticPropertyInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
