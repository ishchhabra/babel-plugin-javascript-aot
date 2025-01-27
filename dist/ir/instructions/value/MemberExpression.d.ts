import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * Represents a member expression.
 *
 * Example:
 * a.b
 * a[b]
 */
export declare class MemberExpressionInstruction extends ValueInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly object: Place;
    readonly property: Place;
    readonly computed: boolean;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, object: Place, property: Place, computed: boolean);
    clone(environment: Environment): MemberExpressionInstruction;
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
