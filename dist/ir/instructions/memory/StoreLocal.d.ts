import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { InstructionId, MemoryInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * Represents a memory instruction that stores a value at a given place.
 *
 * @example
 * ```typescript
 * const x = 5;
 * ```
 */
export declare class StoreLocalInstruction extends MemoryInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly lval: Place;
    readonly value: Place;
    readonly type: "let" | "const" | "var";
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, lval: Place, value: Place, type: "let" | "const" | "var");
    clone(environment: Environment): StoreLocalInstruction;
    rewrite(values: Map<Identifier, Place>): StoreLocalInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
