import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ModuleInstruction } from "../../base";
import { Place } from "../../core";
/**
 * Represents an import declaration.
 *
 * Example:
 * import x from "y";
 * import { x } from "y";
 */
export declare class ImportDeclarationInstruction extends ModuleInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly source: string;
    readonly resolvedSource: string;
    readonly specifiers: Place[];
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, source: string, resolvedSource: string, specifiers: Place[]);
    clone(environment: Environment): ImportDeclarationInstruction;
    rewriteInstruction(): BaseInstruction;
    getReadPlaces(): Place[];
}
