import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, DeclarationInstruction, InstructionId } from "../../base";
import { Identifier, Place } from "../../core";
import { FunctionIR } from "../../core/FunctionIR";
export declare class FunctionDeclarationInstruction extends DeclarationInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly identifier: Place;
    readonly params: Place[];
    readonly functionIR: FunctionIR;
    readonly generator: boolean;
    readonly async: boolean;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, identifier: Place, params: Place[], functionIR: FunctionIR, generator: boolean, async: boolean);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
