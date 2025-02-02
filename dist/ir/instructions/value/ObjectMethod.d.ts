import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";
import { FunctionIR } from "../../core/FunctionIR";
/**
 * Represents an object method in the IR.
 *
 * Examples:
 * - `{ foo() {} } // foo is the object method`
 */
export declare class ObjectMethodInstruction extends ValueInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly key: Place;
    readonly body: FunctionIR;
    readonly computed: boolean;
    readonly generator: boolean;
    readonly async: boolean;
    readonly kind: "method" | "get" | "set";
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, key: Place, body: FunctionIR, computed: boolean, generator: boolean, async: boolean, kind: "method" | "get" | "set");
    clone(environment: Environment): ObjectMethodInstruction;
    rewrite(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
}
