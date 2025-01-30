import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";

/**
 * Represents a unary expression.
 *
 * Example:
 * !a
 * delete a
 */
export class UnaryExpressionInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly operator: t.UnaryExpression["operator"],
    public readonly argument: Place,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): UnaryExpressionInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      UnaryExpressionInstruction,
      place,
      this.nodePath,
      this.operator,
      this.argument,
    );
  }

  rewrite(values: Map<Identifier, Place>): BaseInstruction {
    return new UnaryExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.operator,
      values.get(this.argument.identifier) ?? this.argument,
    );
  }

  getReadPlaces(): Place[] {
    return [this.argument];
  }

  public get isPure(): boolean {
    return ["throw", "delete"].includes(this.operator);
  }
}
