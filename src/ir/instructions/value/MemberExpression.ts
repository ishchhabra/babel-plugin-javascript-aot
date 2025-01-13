import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";

/**
 * Represents a member expression.
 *
 * Example:
 * a.b
 * a[b]
 */
export class MemberExpressionInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly object: Place,
    public readonly property: Place,
    public readonly computed: boolean,
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new MemberExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.object.identifier) ?? this.object,
      values.get(this.property.identifier) ?? this.property,
      this.computed,
    );
  }

  getReadPlaces(): Place[] {
    return [this.object, this.property];
  }

  public get isPure(): boolean {
    return false;
  }
}
