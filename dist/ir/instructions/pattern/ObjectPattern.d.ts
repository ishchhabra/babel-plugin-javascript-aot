import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, Identifier, InstructionId, PatternInstruction, Place } from "../..";
import { Environment } from "../../../environment";
/**
 * Represents an object pattern in the IR.
 *
 * Examples:
 * - `const { x, y } = { x: 1, y: 2 } // { x, y } is the object pattern`
 */
export declare class ObjectPatternInstruction extends PatternInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.ObjectPattern> | undefined;
    readonly properties: Place[];
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.ObjectPattern> | undefined, properties: Place[]);
    clone(environment: Environment): ObjectPatternInstruction;
    rewrite(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
}
