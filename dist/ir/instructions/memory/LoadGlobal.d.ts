import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, MemoryInstruction } from "../../base";
import { Place } from "../../core";
/**
 * Represents a memory instruction that loads a value for a global variable to a place.
 *
 * For example, when `console.log` is referenced, its value needs to be loaded from the global scope
 * before it can be used.
 */
export declare class LoadGlobalInstruction extends MemoryInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly name: string;
    readonly kind: "builtin" | "import";
    readonly source?: string | undefined;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, name: string, kind: "builtin" | "import", source?: string | undefined);
    clone(environment: Environment): LoadGlobalInstruction;
    rewriteInstruction(): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
