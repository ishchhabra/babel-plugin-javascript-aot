import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";

/**
 * Represents an array expression.
 *
 * Example:
 * [1, 2, 3]
 */
export class ArrayExpressionInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly elements: Place[],
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new ArrayExpressionInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.elements.map((element) => values.get(element.identifier) ?? element),
    );
  }

  getReadPlaces(): Place[] {
    return this.elements;
  }

  public get isPure(): boolean {
    return true;
  }
}
