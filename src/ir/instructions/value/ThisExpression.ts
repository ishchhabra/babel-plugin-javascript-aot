import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Place } from "../../core";

export class ThisExpressionInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.ThisExpression> | undefined,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): ThisExpressionInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      ThisExpressionInstruction,
      place,
      this.nodePath,
    );
  }

  rewrite(): BaseInstruction {
    return this;
  }

  getReadPlaces(): Place[] {
    return [];
  }

  public get isPure(): boolean {
    return true;
  }
}
