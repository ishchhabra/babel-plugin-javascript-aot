import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { BaseInstruction, InstructionId, JSXInstruction } from "../../base";
import { Identifier, Place } from "../../core";

/**
 * Represents a JSX fragment in the IR.
 *
 * Examples:
 * - `<></>`
 * - `<>{foo}</>`
 */
export class JSXFragmentInstruction extends JSXInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly openingFragment: Place,
    public readonly closingFragment: Place,
    public readonly children: Place[],
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new JSXFragmentInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.openingFragment,
      this.closingFragment,
      this.children.map((child) => values.get(child.identifier) ?? child),
    );
  }

  getReadPlaces(): Place[] {
    return [this.openingFragment, this.closingFragment, ...this.children];
  }
}
