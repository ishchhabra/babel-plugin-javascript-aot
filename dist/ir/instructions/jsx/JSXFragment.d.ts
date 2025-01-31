import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { InstructionId, JSXInstruction } from "../../base";
import { Identifier, Place } from "../../core";
/**
 * Represents a JSX fragment in the IR.
 *
 * Examples:
 * - `<></>`
 * - `<>{foo}</>`
 */
export declare class JSXFragmentInstruction extends JSXInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly openingFragment: Place;
    readonly closingFragment: Place;
    readonly children: Place[];
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, openingFragment: Place, closingFragment: Place, children: Place[]);
    clone(environment: Environment): JSXFragmentInstruction;
    rewrite(values: Map<Identifier, Place>): JSXFragmentInstruction;
    getReadPlaces(): Place[];
}
