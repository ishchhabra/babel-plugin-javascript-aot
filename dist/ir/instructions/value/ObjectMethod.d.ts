import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { BlockId, Identifier, Place } from "../../core";
/**
 * Represents an object method in the IR.
 *
 * Examples:
 * - `{ foo() {} } // foo is the object method`
 */
export declare class ObjectMethodInstruction extends ValueInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly key: Place;
    readonly params: Place[];
    readonly body: BlockId;
    readonly computed: boolean;
    readonly generator: boolean;
    readonly async: boolean;
    readonly kind: "method" | "get" | "set";
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, key: Place, params: Place[], body: BlockId, computed: boolean, generator: boolean, async: boolean, kind: "method" | "get" | "set");
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
}