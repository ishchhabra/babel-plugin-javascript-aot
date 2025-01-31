import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, DeclarationInstruction, InstructionId } from "../../base";
import { Identifier, Place } from "../../core";
export declare class ClassDeclarationInstruction extends DeclarationInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.ClassDeclaration> | undefined;
    readonly identifier: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.ClassDeclaration> | undefined, identifier: Place);
    clone(environment: Environment): ClassDeclarationInstruction;
    rewrite(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
