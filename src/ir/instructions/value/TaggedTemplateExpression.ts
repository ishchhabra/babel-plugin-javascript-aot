import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";

export class TaggedTemplateExpressionInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.TaggedTemplateExpression> | undefined,
    public readonly tag: Place,
    public readonly quasi: Place,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): TaggedTemplateExpressionInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      TaggedTemplateExpressionInstruction,
      place,
      this.nodePath,
      this.tag,
      this.quasi,
    );
  }

  rewrite(values: Map<Identifier, Place>): BaseInstruction {
    return new TaggedTemplateExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.tag.identifier) ?? this.tag,
      values.get(this.quasi.identifier) ?? this.quasi,
    );
  }

  getReadPlaces(): Place[] {
    return [this.tag, this.quasi];
  }

  public get isPure(): boolean {
    return false;
  }
}
