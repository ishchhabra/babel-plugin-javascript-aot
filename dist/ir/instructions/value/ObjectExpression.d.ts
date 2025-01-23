import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * Represents an object expression.
 *
 * Example:
 * { a: 1, b: 2 }
 */
export declare class ObjectExpressionInstruction extends ValueInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly properties: Place[];
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, properties: Place[]);
    clone(environment: Environment): ObjectExpressionInstruction;
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
