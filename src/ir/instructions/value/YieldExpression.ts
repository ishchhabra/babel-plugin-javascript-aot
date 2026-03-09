import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";

export class YieldExpressionInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.YieldExpression> | undefined,
    public readonly argument: Place | undefined,
    public readonly delegate: boolean,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): YieldExpressionInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      YieldExpressionInstruction,
      place,
      this.nodePath,
      this.argument,
      this.delegate,
    );
  }

  rewrite(values: Map<Identifier, Place>): BaseInstruction {
    return new YieldExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.argument
        ? (values.get(this.argument.identifier) ?? this.argument)
        : undefined,
      this.delegate,
    );
  }

  getReadPlaces(): Place[] {
    return this.argument ? [this.argument] : [];
  }

  public get isPure(): boolean {
    return false;
  }
}
