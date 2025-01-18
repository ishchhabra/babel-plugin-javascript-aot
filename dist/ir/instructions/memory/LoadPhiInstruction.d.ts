import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { InstructionId, MemoryInstruction } from "../../base";
import { Identifier, Place } from "../../core";
export declare class LoadPhiInstruction extends MemoryInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly value: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, value: Place);
    rewriteInstruction(values: Map<Identifier, Place>): LoadPhiInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
