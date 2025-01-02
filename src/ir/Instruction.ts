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
    public readonly argumentPlace: Place,
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
}

export abstract class ExpressionInstruction extends BaseInstruction {}

export abstract class StatementInstruction extends BaseInstruction {}

export abstract class MiscellaneousInstruction extends BaseInstruction {}

export class ArrayExpressionInstruction extends ExpressionInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly argumentPlace: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly elements: Place[]
  ) {
    super(id, argumentPlace, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new ArrayExpressionInstruction(
      this.id,
      this.argumentPlace,
      this.nodePath,
      this.elements.map(
        (element) => values.get(element.identifier.id) ?? element
      )
    );
  }
}

export class BinaryExpressionInstruction extends ExpressionInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly argumentPlace: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly operator: t.BinaryExpression["operator"],
    public readonly left: Place,
    public readonly right: Place
  ) {
    super(id, argumentPlace, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new BinaryExpressionInstruction(
      this.id,
      this.argumentPlace,
      this.nodePath,
      this.operator,
      values.get(this.left.identifier.id) ?? this.left,
      values.get(this.right.identifier.id) ?? this.right
    );
  }
}

export class CallExpressionInstruction extends ExpressionInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly argumentPlace: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly callee: Place,
    // Using args instead of arguments since arguments is a reserved word
    public readonly args: Place[]
  ) {
    super(id, argumentPlace, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new CallExpressionInstruction(
      this.id,
      this.argumentPlace,
      this.nodePath,
      values.get(this.callee.identifier.id) ?? this.callee,
      this.args.map((arg) => values.get(arg.identifier.id) ?? arg)
    );
  }
}

export class CopyInstruction extends ExpressionInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly argumentPlace: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly lval: Place,
    public readonly value: Place
  ) {
    super(id, argumentPlace, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new CopyInstruction(
      this.id,
      this.argumentPlace,
      this.nodePath,
      values.get(this.lval.identifier.id) ?? this.lval,
      values.get(this.value.identifier.id) ?? this.value
    );
  }
}

export class ExpressionStatementInstruction extends StatementInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly argumentPlace: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly expression: Place
  ) {
    super(id, argumentPlace, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new ExpressionStatementInstruction(
      this.id,
      this.argumentPlace,
      this.nodePath,
      values.get(this.expression.identifier.id) ?? this.expression
    );
  }
}

export class FunctionDeclarationInstruction extends StatementInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly argumentPlace: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly params: Place[],
    public readonly body: BlockId,
    public readonly generator: boolean,
    public readonly async: boolean
  ) {
    super(id, argumentPlace, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new FunctionDeclarationInstruction(
      this.id,
      this.argumentPlace,
      this.nodePath,
      this.params.map((param) => values.get(param.identifier.id) ?? param),
      this.body,
      this.generator,
      this.async
    );
  }
}

export class HoleInstruction extends MiscellaneousInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly argumentPlace: Place,
    public readonly nodePath: NodePath<null>
  ) {
    super(id, argumentPlace, nodePath);
  }

  rewriteInstruction(): BaseInstruction {
    // Hole can not be rewritten.
    return this;
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
    public readonly argumentPlace: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly value: TPrimitiveValue
  ) {
    super(id, argumentPlace, nodePath);
  }

  rewriteInstruction(): BaseInstruction {
    // Literals can not be rewritten.
    return this;
  }
}

export class LoadLocalInstruction extends ExpressionInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly argumentPlace: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly target: Place
  ) {
    super(id, argumentPlace, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new LoadLocalInstruction(
      this.id,
      this.argumentPlace,
      this.nodePath,
      values.get(this.target.identifier.id) ?? this.target
    );
  }
}

export class SpreadElementInstruction extends MiscellaneousInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly argumentPlace: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly argument: Place
  ) {
    super(id, argumentPlace, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new SpreadElementInstruction(
      this.id,
      this.argumentPlace,
      this.nodePath,
      values.get(this.argument.identifier.id) ?? this.argument
    );
  }
}

export class StoreLocalInstruction extends StatementInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly argumentPlace: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly lval: Place,
    public readonly value: Place,
    public readonly type: "let" | "const" | "var"
  ) {
    super(id, argumentPlace, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new StoreLocalInstruction(
      this.id,
      this.argumentPlace,
      this.nodePath,
      this.lval,
      values.get(this.value.identifier.id) ?? this.value,
      this.type
    );
  }
}

export class UnaryExpressionInstruction extends ExpressionInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly argumentPlace: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly operator: t.UnaryExpression["operator"],
    public readonly argument: Place
  ) {
    super(id, argumentPlace, nodePath);
  }

  rewriteInstruction(values: Map<IdentifierId, Place>): BaseInstruction {
    return new UnaryExpressionInstruction(
      this.id,
      this.argumentPlace,
      this.nodePath,
      this.operator,
      values.get(this.argument.identifier.id) ?? this.argument
    );
  }
}

export class UnsupportedNodeInstruction extends BaseInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly argumentPlace: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly node: t.Node
  ) {
    super(id, argumentPlace, nodePath);
  }

  rewriteInstruction(): BaseInstruction {
    // Unsupported nodes can not be rewritten.
    return this;
  }
}
