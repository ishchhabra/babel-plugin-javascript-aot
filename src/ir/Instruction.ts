import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BlockId } from "./Block";
import { IdentifierId } from "./Identifier";
import { Place } from "./Place";

/**
 * Simulated opaque type for DeclarationId to prevent using normal numbers as ids
 * accidentally.
 */
const opaqueInstructionId = Symbol();
export type InstructionId = number & { [opaqueInstructionId]: "InstructionId" };

export function makeInstructionId(id: number): InstructionId {
  return id as InstructionId;
}

/**
 * Base class for all instructions.
 *
 * @param id - The unique identifier for the instruction.
 * @param place - The place where the instruction is stored.
 */
export abstract class BaseInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node | null> | undefined
  ) {}

  /**
   * Rewrites the instruction to use values.
   *
   * @param values - A map of old values to new values.
   * @returns The rewritten instruction.
   */
  abstract rewriteInstruction(
    values: Map<IdentifierId, Place>
  ): BaseInstruction;

  /**
   * Return a set of place IDs that this instruction *reads* (uses).
   */
  abstract getReadPlaces(): Place[];

  /** Whether this instruction is pure. */
  public get isPure(): boolean {
    return false;
  }
}

export abstract class ExpressionInstruction extends BaseInstruction {}

export abstract class StatementInstruction extends BaseInstruction {}

export abstract class MiscellaneousInstruction extends BaseInstruction {}

export class ArrayExpressionInstruction extends ExpressionInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly elements: Place[]
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new ArrayExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.elements.map(
        (element) => values.get(element.identifier.id) ?? element
      )
    );
  }

  getReadPlaces(): Place[] {
    return this.elements;
  }

  public get isPure(): boolean {
    return true;
  }
}

export class BinaryExpressionInstruction extends ExpressionInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly operator: t.BinaryExpression["operator"],
    public readonly left: Place,
    public readonly right: Place
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new BinaryExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.operator,
      values.get(this.left.identifier.id) ?? this.left,
      values.get(this.right.identifier.id) ?? this.right
    );
  }

  getReadPlaces(): Place[] {
    return [this.left, this.right];
  }

  public get isPure(): boolean {
    return true;
  }
}

export class CallExpressionInstruction extends ExpressionInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly callee: Place,
    // Using args instead of arguments since arguments is a reserved word
    public readonly args: Place[]
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new CallExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.callee.identifier.id) ?? this.callee,
      this.args.map((arg) => values.get(arg.identifier.id) ?? arg)
    );
  }

  getReadPlaces(): Place[] {
    return [this.callee, ...this.args];
  }

  public get isPure(): boolean {
    return false;
  }
}

export class CopyInstruction extends ExpressionInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly lval: Place,
    public readonly value: Place
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new CopyInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.lval.identifier.id) ?? this.lval,
      values.get(this.value.identifier.id) ?? this.value
    );
  }

  getReadPlaces(): Place[] {
    return [this.lval, this.value];
  }

  public get isPure(): boolean {
    return true;
  }
}

export class ExpressionStatementInstruction extends StatementInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly expression: Place
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new ExpressionStatementInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.expression.identifier.id) ?? this.expression
    );
  }

  getReadPlaces(): Place[] {
    return [this.expression];
  }

  public get isPure(): boolean {
    return false;
  }
}

export class FunctionDeclarationInstruction extends StatementInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly params: Place[],
    public readonly body: BlockId,
    public readonly generator: boolean,
    public readonly async: boolean
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new FunctionDeclarationInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.params.map((param) => values.get(param.identifier.id) ?? param),
      this.body,
      this.generator,
      this.async
    );
  }

  getReadPlaces(): Place[] {
    return this.params;
  }

  public get isPure(): boolean {
    return false;
  }
}

export class HoleInstruction extends MiscellaneousInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<null>
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(): BaseInstruction {
    // Hole can not be rewritten.
    return this;
  }

  getReadPlaces(): Place[] {
    return [];
  }

  public get isPure(): boolean {
    return true;
  }
}

export type TPrimitiveValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | bigint
  | symbol;

export class LiteralInstruction extends ExpressionInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly value: TPrimitiveValue
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(): BaseInstruction {
    // Literals can not be rewritten.
    return this;
  }

  getReadPlaces(): Place[] {
    return [];
  }

  public get isPure(): boolean {
    return true;
  }
}

export class LoadGlobalInstruction extends ExpressionInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly name: string
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(): BaseInstruction {
    // LoadGlobal can not be rewritten.
    return this;
  }

  getReadPlaces(): Place[] {
    return [];
  }

  public get isPure(): boolean {
    return false;
  }
}

export class LoadLocalInstruction extends ExpressionInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly value: Place
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    const rewrittenTarget = values.get(this.value.identifier.id) ?? this.value;

    if (rewrittenTarget === this.value) {
      return this;
    }

    return new LoadLocalInstruction(
      this.id,
      this.place,
      this.nodePath,
      rewrittenTarget
    );
  }

  getReadPlaces(): Place[] {
    return [this.value];
  }

  public get isPure(): boolean {
    return true;
  }
}

export class MemberExpressionInstruction extends ExpressionInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly object: Place,
    public readonly property: Place,
    public readonly computed: boolean
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new MemberExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.object.identifier.id) ?? this.object,
      values.get(this.property.identifier.id) ?? this.property,
      this.computed
    );
  }

  getReadPlaces(): Place[] {
    return [this.object, this.property];
  }

  public get isPure(): boolean {
    return false;
  }
}

export class SpreadElementInstruction extends MiscellaneousInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly argument: Place
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new SpreadElementInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.argument.identifier.id) ?? this.argument
    );
  }

  getReadPlaces(): Place[] {
    return [this.argument];
  }

  public get isPure(): boolean {
    return true;
  }
}

export class StoreLocalInstruction extends StatementInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly lval: Place,
    public readonly value: Place,
    public readonly type: "let" | "const" | "var"
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new StoreLocalInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.lval,
      values.get(this.value.identifier.id) ?? this.value,
      this.type
    );
  }

  getReadPlaces(): Place[] {
    return [this.value];
  }

  public get isPure(): boolean {
    return true;
  }
}

export class UnaryExpressionInstruction extends ExpressionInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly operator: t.UnaryExpression["operator"],
    public readonly argument: Place
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new UnaryExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.operator,
      values.get(this.argument.identifier.id) ?? this.argument
    );
  }

  getReadPlaces(): Place[] {
    return [this.argument];
  }

  public get isPure(): boolean {
    return ["throw", "delete"].includes(this.operator);
  }
}

export class UnsupportedNodeInstruction extends BaseInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly node: t.Node
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(): BaseInstruction {
    // Unsupported nodes can not be rewritten.
    return this;
  }

  getReadPlaces(): Place[] {
    throw new Error("Unable to get read places for unsupported node");
  }

  public get isPure(): boolean {
    return false;
  }
}
