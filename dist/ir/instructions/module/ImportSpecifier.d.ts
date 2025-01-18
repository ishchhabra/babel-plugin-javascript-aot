import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, ModuleInstruction } from "../../base";
import { Place } from "../../core";
/**
 * Represents an import specifier.
 *
 * Example:
 * import { x } from "y"; // x is the import specifier
 */
export declare class ImportSpecifierInstruction extends ModuleInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly imported: Place;
    readonly local: Place | undefined;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, imported: Place, local: Place | undefined);
    rewriteInstruction(): BaseInstruction;
    getReadPlaces(): Place[];
}
