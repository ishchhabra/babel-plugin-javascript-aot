import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { BaseInstruction, InstructionId } from "../base";
import { Identifier, Place } from "../core";
/**
 * Represents a rest element in the IR.
 *
 * Examples:
 * - const [a, ...b] = [1, 2, 3, 4, 5];
 */
export declare class RestElementInstruction extends BaseInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.RestElement>;
    readonly argument: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.RestElement>, argument: Place);
    clone(environment: Environment): RestElementInstruction;
    rewrite(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
