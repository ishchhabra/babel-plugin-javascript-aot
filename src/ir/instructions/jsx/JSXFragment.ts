import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { InstructionId, JSXInstruction } from "../../base";
import { Identifier, Place } from "../../core";
import { createInstructionId } from "../../utils";

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

  public clone(environment: Environment): JSXFragmentInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instructionId = createInstructionId(environment);
    return new JSXFragmentInstruction(
      instructionId,
      place,
      this.nodePath,
      this.openingFragment,
      this.closingFragment,
      this.children,
    );
  }

  rewriteInstruction(values: Map<Identifier, Place>): JSXFragmentInstruction {
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
