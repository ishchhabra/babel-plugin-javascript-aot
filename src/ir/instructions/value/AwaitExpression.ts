import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";

export class AwaitExpressionInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.AwaitExpression> | undefined,
    public readonly argument: Place,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): AwaitExpressionInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      AwaitExpressionInstruction,
      place,
      this.nodePath,
      this.argument,
    );
  }

  rewrite(values: Map<Identifier, Place>): BaseInstruction {
    return new AwaitExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.argument.identifier) ?? this.argument,
    );
  }

  getReadPlaces(): Place[] {
    return [this.argument];
  }

  public get isPure(): boolean {
    return false;
  }
}
