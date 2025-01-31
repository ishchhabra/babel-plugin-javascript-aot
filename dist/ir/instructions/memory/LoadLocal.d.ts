import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, MemoryInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * Represents an instruction that loads a value from one place to another place.
 * This is used to move values between different memory locations in the IR.
 *
 * For example, when a variable is referenced, its value needs to be loaded from its storage location
 * to the place where it's being used.
 */
export declare class LoadLocalInstruction extends MemoryInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly value: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, value: Place);
    clone(environment: Environment): LoadLocalInstruction;
    rewrite(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
