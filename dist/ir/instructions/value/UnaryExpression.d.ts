import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * Represents a unary expression.
 *
 * Example:
 * !a
 * delete a
 */
export declare class UnaryExpressionInstruction extends ValueInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly operator: t.UnaryExpression["operator"];
    readonly argument: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, operator: t.UnaryExpression["operator"], argument: Place);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}