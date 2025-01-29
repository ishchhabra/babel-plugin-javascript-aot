import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
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
    readonly local: string;
    readonly imported: string;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, local: string, imported: string);
    clone(environment: Environment): ImportSpecifierInstruction;
    rewriteInstruction(): BaseInstruction;
    getReadPlaces(): Place[];
}
