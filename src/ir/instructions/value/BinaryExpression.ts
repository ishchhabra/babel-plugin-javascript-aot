import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";

/**
 * Represents a binary expression.
 *
 * Example:
 * 1 + 2
 */
export class BinaryExpressionInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly operator: t.BinaryExpression["operator"],
    public readonly left: Place,
    public readonly right: Place,
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
      values.get(this.right.identifier) ?? this.right,
    );
  }

  getReadPlaces(): Place[] {
    return [this.left, this.right];
  }

  public get isPure(): boolean {
    return true;
  }
}
