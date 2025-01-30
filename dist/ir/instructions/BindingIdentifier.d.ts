import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../environment";
import { BaseInstruction, InstructionId } from "../base";
import { Place } from "../core";
/**
 * Represents a binding identifier in the IR.
 *
 * A binding identifier is used when declaring new identifiers that are not already
 * in context. This differs from a load instruction which references existing identifiers.
 *
 * Examples:
 * - Variable declarations: `let x = 10` - "x" is a binding identifier
 * - Import declarations: `import { x } from "y"` - "x" is a binding identifier
 * - Function parameters: `function f(x) {}` - "x" is a binding identifier
 */
export declare class BindingIdentifierInstruction extends BaseInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly name: string;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, name: string);
    clone(environment: Environment): BindingIdentifierInstruction;
    rewrite(): BaseInstruction;
    getReadPlaces(): Place[];
}
