import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
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
    readonly nodePath: NodePath<t.CallExpression> | undefined;
    readonly callee: Place;
    readonly args: Place[];
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.CallExpression> | undefined, callee: Place, args: Place[]);
    clone(environment: Environment): CallExpressionInstruction;
    rewrite(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
