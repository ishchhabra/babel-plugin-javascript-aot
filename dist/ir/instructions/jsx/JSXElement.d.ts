import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, JSXInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * Represents a JSX element in the IR.
 *
 * Examples:
 * - `<div />`
 * - `<div>Hello, world!</div>`
 */
export declare class JSXElementInstruction extends JSXInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly openingElement: Place;
    readonly closingElement: Place;
    readonly children: Place[];
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, openingElement: Place, closingElement: Place, children: Place[]);
    clone(environment: Environment): JSXElementInstruction;
    rewrite(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
}
