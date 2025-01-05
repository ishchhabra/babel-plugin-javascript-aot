import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BlockId } from "./Block";
import { Identifier } from "./Identifier";
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
  abstract rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction;

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

export abstract class PatternInstruction extends BaseInstruction {}

export abstract class JSXInstruction extends BaseInstruction {}

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

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new ArrayExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.elements.map((element) => values.get(element.identifier) ?? element)
    );
  }

  getReadPlaces(): Place[] {
    return this.elements;
  }

  public get isPure(): boolean {
    return true;
  }
}

export class ArrayPatternInstruction extends PatternInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly elements: Place[]
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new ArrayPatternInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.elements.map((element) => values.get(element.identifier) ?? element)
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

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new BinaryExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.operator,
      values.get(this.left.identifier) ?? this.left,
      values.get(this.right.identifier) ?? this.right
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

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new CallExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.callee.identifier) ?? this.callee,
      this.args.map((arg) => values.get(arg.identifier) ?? arg)
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

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new CopyInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.lval.identifier) ?? this.lval,
      values.get(this.value.identifier) ?? this.value
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

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new ExpressionStatementInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.expression.identifier) ?? this.expression
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

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new FunctionDeclarationInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.params.map((param) => values.get(param.identifier) ?? param),
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

export class JSXElementInstruction extends JSXInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly openingElement: Place,
    public readonly closingElement: Place,
    public readonly children: Place[]
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new JSXElementInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.openingElement.identifier) ?? this.openingElement,
      values.get(this.closingElement.identifier) ?? this.closingElement,
      this.children.map((child) => values.get(child.identifier) ?? child)
    );
  }

  getReadPlaces(): Place[] {
    return [this.openingElement, this.closingElement, ...this.children];
  }
}

export class JSXFragmentInstruction extends JSXInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly openingFragment: Place,
    public readonly closingFragment: Place,
    public readonly children: Place[]
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new JSXFragmentInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.openingFragment,
      this.closingFragment,
      this.children.map((child) => values.get(child.identifier) ?? child)
    );
  }

  getReadPlaces(): Place[] {
    return [this.openingFragment, this.closingFragment, ...this.children];
  }
}

export class JSXTextInstruction extends JSXInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly value: string
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(): BaseInstruction {
    // JSXText can not be rewritten.
    return this;
  }

  getReadPlaces(): Place[] {
    return [];
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

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    const rewrittenTarget = values.get(this.value.identifier) ?? this.value;

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

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new MemberExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.object.identifier) ?? this.object,
      values.get(this.property.identifier) ?? this.property,
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

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new SpreadElementInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.argument.identifier) ?? this.argument
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

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new StoreLocalInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.lval,
      values.get(this.value.identifier) ?? this.value,
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

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new UnaryExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.operator,
      values.get(this.argument.identifier) ?? this.argument
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

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    for (const [identifier, place] of values) {
      // The only other place we're renaming is in the binding phase of the
      // HIR Builder. So, when we rename here, we need to use the declaration
      // name of the identifier that we're renaming.

      // Since by definition, there can only be one phi node for a variable
      // in a block, it is safe to do this.
      const oldName = `$${identifier.declarationId}_0`;
      const newName = place.identifier.name;
      this.nodePath?.scope.rename(oldName, newName);
    }

    return this;
  }

  getReadPlaces(): Place[] {
    throw new Error("Unable to get read places for unsupported node");
  }

  public get isPure(): boolean {
    return false;
  }
}
