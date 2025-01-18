import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * Represents a binary expression.
 *
 * Example:
 * 1 + 2
 */
export declare class BinaryExpressionInstruction extends ValueInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly operator: t.BinaryExpression["operator"];
    readonly left: Place;
    readonly right: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, operator: t.BinaryExpression["operator"], left: Place, right: Place);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
