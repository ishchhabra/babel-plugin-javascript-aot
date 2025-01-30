import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, JSXInstruction } from "../../base";
import { Identifier, Place } from "../../core";

/**
 * Represents a JSX element in the IR.
 *
 * Examples:
 * - `<div />`
 * - `<div>Hello, world!</div>`
 */
export class JSXElementInstruction extends JSXInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly openingElement: Place,
    public readonly closingElement: Place,
    public readonly children: Place[],
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): JSXElementInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      JSXElementInstruction,
      place,
      this.nodePath,
      this.openingElement,
      this.closingElement,
      this.children,
    );
  }

  rewrite(values: Map<Identifier, Place>): BaseInstruction {
    return new JSXElementInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.openingElement.identifier) ?? this.openingElement,
      values.get(this.closingElement.identifier) ?? this.closingElement,
      this.children.map((child) => values.get(child.identifier) ?? child),
    );
  }

  getReadPlaces(): Place[] {
    return [this.openingElement, this.closingElement, ...this.children];
  }
}
