import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId } from "../base";
import { Identifier, Place } from "../core";

/**
 * Represents an expression statement in the IR.
 *
 * An expression statement is a statement that contains an expression.
 *
 * For example, `x + 1` is an expression statement.
 */
export class ExpressionStatementInstruction extends BaseInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly expression: Place,
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new ExpressionStatementInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.expression.identifier) ?? this.expression,
    );
  }

  getReadPlaces(): Place[] {
    return [this.expression];
  }

  public get isPure(): boolean {
    return false;
  }
}
