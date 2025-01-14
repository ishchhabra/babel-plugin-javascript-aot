import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, DeclarationInstruction, InstructionId } from "../../base";
import { BlockId, Identifier, Place } from "../../core";
export declare class FunctionDeclarationInstruction extends DeclarationInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly params: Place[];
    readonly body: BlockId;
    readonly generator: boolean;
    readonly async: boolean;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, params: Place[], body: BlockId, generator: boolean, async: boolean);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
