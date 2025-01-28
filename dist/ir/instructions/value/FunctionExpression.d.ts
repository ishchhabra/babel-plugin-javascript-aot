import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { FunctionIR } from "../../core/FunctionIR";
import { Identifier } from "../../core/Identifier";
import { Place } from "../../core/Place";
export declare class FunctionExpressionInstruction extends ValueInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly identifier: Place | null;
    readonly functionIR: FunctionIR;
    readonly generator: boolean;
    readonly async: boolean;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, identifier: Place | null, functionIR: FunctionIR, generator: boolean, async: boolean);
    clone(environment: Environment): FunctionExpressionInstruction;
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
