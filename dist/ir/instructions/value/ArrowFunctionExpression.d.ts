import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { FunctionIR } from "../../core/FunctionIR";
import { Place } from "../../core/Place";
/**
 * Represents an arrow function expression, e.g.
 *   `const arrow = (x) => x + 1;`
 *
 * The `functionIR` property contains the IR for the arrow's body,
 * `async` indicates if it's `async ( ) => { }`,
 * `expression` indicates if it has a concise expression body rather than a block.
 */
export declare class ArrowFunctionExpressionInstruction extends ValueInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.ArrowFunctionExpression> | undefined;
    readonly functionIR: FunctionIR;
    readonly async: boolean;
    readonly expression: boolean;
    readonly generator: boolean;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.ArrowFunctionExpression> | undefined, functionIR: FunctionIR, async: boolean, expression: boolean, generator: boolean);
    clone(environment: Environment): ArrowFunctionExpressionInstruction;
    rewriteInstruction(): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
