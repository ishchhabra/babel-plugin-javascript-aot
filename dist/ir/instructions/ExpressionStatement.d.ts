import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId } from "../base";
import { Identifier, Place } from "../core";
/**
 * Represents an expression statement in the IR.
 *
 * An expression statement is a statement that contains an expression.
 *
 * For example, `x + 1` is an expression statement.
 */
export declare class ExpressionStatementInstruction extends BaseInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly expression: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, expression: Place);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
