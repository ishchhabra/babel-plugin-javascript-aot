import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Place } from "../../core";
export type TPrimitiveValue = string | number | boolean | null | undefined | bigint | symbol;
/**
 * Represents a literal value.
 *
 * Example:
 * 42
 * "hello"
 * true
 */
export declare class LiteralInstruction extends ValueInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly value: TPrimitiveValue;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, value: TPrimitiveValue);
    rewriteInstruction(): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
