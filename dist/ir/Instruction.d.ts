import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BlockId } from "./Block";
import { Identifier } from "./Identifier";
import { Place } from "./Place";
/**
 * Simulated opaque type for DeclarationId to prevent using normal numbers as ids
 * accidentally.
 */
declare const opaqueInstructionId: unique symbol;
export type InstructionId = number & {
    [opaqueInstructionId]: "InstructionId";
};
export declare function makeInstructionId(id: number): InstructionId;
/**
 * Base class for all instructions.
 *
 * @param id - The unique identifier for the instruction.
 * @param place - The place where the instruction is stored.
 */
export declare abstract class BaseInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node | null> | undefined;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node | null> | undefined);
    /**
     * Rewrites the instruction to use values.
     *
     * @param values - A map of old values to new values.
     * @returns The rewritten instruction.
     */
    abstract rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    /**
     * Return a set of place IDs that this instruction *reads* (uses).
     */
    abstract getReadPlaces(): Place[];
    /** Whether this instruction is pure. */
    get isPure(): boolean;
}
export declare abstract class ExpressionInstruction extends BaseInstruction {
}
export declare abstract class StatementInstruction extends BaseInstruction {
}
export declare abstract class PatternInstruction extends BaseInstruction {
}
export declare abstract class JSXInstruction extends BaseInstruction {
}
export declare abstract class MiscellaneousInstruction extends BaseInstruction {
}
export declare class ArrayExpressionInstruction extends ExpressionInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly elements: Place[];
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, elements: Place[]);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export declare class ArrayPatternInstruction extends PatternInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly elements: Place[];
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, elements: Place[]);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export declare class BinaryExpressionInstruction extends ExpressionInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly operator: t.BinaryExpression["operator"];
    readonly left: Place;
    readonly right: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, operator: t.BinaryExpression["operator"], left: Place, right: Place);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export declare class CallExpressionInstruction extends ExpressionInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly callee: Place;
    readonly args: Place[];
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, callee: Place, args: Place[]);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export declare class CopyInstruction extends ExpressionInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly lval: Place;
    readonly value: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, lval: Place, value: Place);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export declare class ExpressionStatementInstruction extends StatementInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly expression: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, expression: Place);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export declare class FunctionDeclarationInstruction extends StatementInstruction {
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
export declare class HoleInstruction extends MiscellaneousInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<null>;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<null>);
    rewriteInstruction(): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export declare class JSXElementInstruction extends JSXInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly openingElement: Place;
    readonly closingElement: Place;
    readonly children: Place[];
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, openingElement: Place, closingElement: Place, children: Place[]);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
}
export declare class JSXFragmentInstruction extends JSXInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly openingFragment: Place;
    readonly closingFragment: Place;
    readonly children: Place[];
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, openingFragment: Place, closingFragment: Place, children: Place[]);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
}
export declare class JSXTextInstruction extends JSXInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly value: string;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, value: string);
    rewriteInstruction(): BaseInstruction;
    getReadPlaces(): Place[];
}
export type TPrimitiveValue = string | number | boolean | null | undefined | bigint | symbol;
export declare class LiteralInstruction extends ExpressionInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly value: TPrimitiveValue;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, value: TPrimitiveValue);
    rewriteInstruction(): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export declare class LoadGlobalInstruction extends ExpressionInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly name: string;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, name: string);
    rewriteInstruction(): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export declare class LoadLocalInstruction extends ExpressionInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly value: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, value: Place);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export declare class LogicalExpressionInstruction extends ExpressionInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly operator: t.LogicalExpression["operator"];
    readonly left: Place;
    readonly right: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, operator: t.LogicalExpression["operator"], left: Place, right: Place);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export declare class MemberExpressionInstruction extends ExpressionInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly object: Place;
    readonly property: Place;
    readonly computed: boolean;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, object: Place, property: Place, computed: boolean);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export declare class ObjectExpressionInstruction extends ExpressionInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly properties: Place[];
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, properties: Place[]);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export declare class ObjectMethodInstruction extends MiscellaneousInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly key: Place;
    readonly params: Place[];
    readonly body: BlockId;
    readonly computed: boolean;
    readonly generator: boolean;
    readonly async: boolean;
    readonly kind: "method" | "get" | "set";
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, key: Place, params: Place[], body: BlockId, computed: boolean, generator: boolean, async: boolean, kind: "method" | "get" | "set");
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
}
export declare class ObjectPropertyInstruction extends MiscellaneousInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly key: Place;
    readonly value: Place;
    readonly computed: boolean;
    readonly shorthand: boolean;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, key: Place, value: Place, computed: boolean, shorthand: boolean);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
}
export declare class SpreadElementInstruction extends MiscellaneousInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly argument: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, argument: Place);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export declare class StoreLocalInstruction extends StatementInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly lval: Place;
    readonly value: Place;
    readonly type: "let" | "const" | "var";
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, lval: Place, value: Place, type: "let" | "const" | "var");
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export declare class UnaryExpressionInstruction extends ExpressionInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly operator: t.UnaryExpression["operator"];
    readonly argument: Place;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, operator: t.UnaryExpression["operator"], argument: Place);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export declare class UnsupportedNodeInstruction extends BaseInstruction {
    readonly id: InstructionId;
    readonly place: Place;
    readonly nodePath: NodePath<t.Node> | undefined;
    readonly node: t.Node;
    constructor(id: InstructionId, place: Place, nodePath: NodePath<t.Node> | undefined, node: t.Node);
    rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;
    getReadPlaces(): Place[];
    get isPure(): boolean;
}
export {};
