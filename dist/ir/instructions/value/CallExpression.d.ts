import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * Represents a call expression.
 *
 * Example:
 * foo(1, 2)
 */
export declare class CallExpressionInstruction extends ValueInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly callee: Place;
    readonly args: Place[];
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, callee: Place, args: Place[]);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
