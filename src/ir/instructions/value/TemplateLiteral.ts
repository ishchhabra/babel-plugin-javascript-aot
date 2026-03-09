import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";

export class TemplateLiteralInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.TemplateLiteral> | undefined,
    public readonly quasis: t.TemplateElement[],
    public readonly expressions: Place[],
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): TemplateLiteralInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      TemplateLiteralInstruction,
      place,
      this.nodePath,
      this.quasis,
      this.expressions,
    );
  }

  rewrite(values: Map<Identifier, Place>): BaseInstruction {
    return new TemplateLiteralInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.quasis,
      this.expressions.map((expr) => values.get(expr.identifier) ?? expr),
    );
  }

  getReadPlaces(): Place[] {
    return [...this.expressions];
  }

  public get isPure(): boolean {
    return true;
  }
}
