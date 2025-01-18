import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, ModuleInstruction } from "../../base";
import { Place } from "../../core";
/**
 * Represents an export default declaration.
 *
 * Example:
 * export default x;
 */
export declare class ExportDefaultDeclarationInstruction extends ModuleInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly declaration: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, declaration: Place);
    rewriteInstruction(): BaseInstruction;
    getReadPlaces(): Place[];
}
