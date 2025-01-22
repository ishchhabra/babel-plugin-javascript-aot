import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * Represents an array expression.
 *
 * Example:
 * [1, 2, 3]
 */
export declare class ArrayExpressionInstruction extends ValueInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly elements: Place[];
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, elements: Place[]);
    clone(environment: Environment): ArrayExpressionInstruction;
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
