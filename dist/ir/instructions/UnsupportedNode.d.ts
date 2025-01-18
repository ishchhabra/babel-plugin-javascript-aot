import { BaseInstruction } from "../base";
import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { InstructionId } from "../base";
import { Identifier, Place } from "../core";
/**
 * Represents a node that is not supported by the IR. This is used to bail out
 * when we encounter a node that we don't know how to handle.
 *
 * Example:
 * let x = { y: z }
 */
export declare class UnsupportedNodeInstruction extends BaseInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly node: t.Node;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, node: t.Node);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
