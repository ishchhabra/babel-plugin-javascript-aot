import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId } from "../base";
import { Identifier, Place } from "../core";

/**
 * Represents a spread element in the IR.
 *
 * Examples:
 * - `...foo`
 * - `...[1, 2, 3]`
 */
export class SpreadElementInstruction extends BaseInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly argument: Place,
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new SpreadElementInstruction(
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
    return true;
  }
}
