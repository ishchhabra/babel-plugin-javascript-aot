import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, JSXInstruction } from "../../base";
import { Place } from "../../core";
/**
 * Represents a JSX text node in the IR.
 *
 * Examples:
 * - `"Hello, world!"`
 */
export declare class JSXTextInstruction extends JSXInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly value: string;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, value: string);
    clone(environment: Environment): JSXTextInstruction;
    rewrite(): BaseInstruction;
    getReadPlaces(): Place[];
}
