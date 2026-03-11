import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Place } from "../../core";

export class RegExpLiteralInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly pattern: string,
    public readonly flags: string,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): RegExpLiteralInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      RegExpLiteralInstruction,
      place,
      this.nodePath,
      this.pattern,
      this.flags,
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
