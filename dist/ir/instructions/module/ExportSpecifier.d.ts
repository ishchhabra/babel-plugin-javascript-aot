import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, ModuleInstruction } from "../../base";
import { Place } from "../../core";
/**
 * Represents an export specifier.
 *
 * Example:
 * export { x }; // x is the export specifier
 */
export declare class ExportSpecifierInstruction extends ModuleInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly local: Place;
    readonly exported: string;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, local: Place, exported: string);
    rewriteInstruction(): BaseInstruction;
    getReadPlaces(): Place[];
}
