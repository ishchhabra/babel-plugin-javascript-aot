import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";
import { createInstructionId } from "../../utils";

/**
 * Represents a logical expression.
 *
 * Example:
 * a && b
 * a || b
 */
export class LogicalExpressionInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly operator: t.LogicalExpression["operator"],
    public readonly left: Place,
    public readonly right: Place,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): LogicalExpressionInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instructionId = createInstructionId(environment);
    return new LogicalExpressionInstruction(
      instructionId,
      place,
      this.nodePath,
      this.operator,
      this.left,
      this.right,
    );
  }

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new LogicalExpressionInstruction(
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
    return false;
  }
}
