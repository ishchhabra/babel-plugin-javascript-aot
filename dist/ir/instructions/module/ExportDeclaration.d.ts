import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { InstructionId, ModuleInstruction } from "../../base";
import { Place } from "../../core";
/**
 * Represents an export declaration.
 *
 * Example:
 * export { x };
 * export const y = 1;
 * export * as z from "a";
 */
export declare class ExportDeclarationInstruction extends ModuleInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly specifiers: Place[];
    readonly declaration: Place | undefined;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, specifiers: Place[], declaration: Place | undefined);
    clone(environment: Environment): ExportDeclarationInstruction;
    rewrite(): ExportDeclarationInstruction;
    getReadPlaces(): Place[];
}
