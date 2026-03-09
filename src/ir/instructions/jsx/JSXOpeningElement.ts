import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, JSXInstruction } from "../../base";
import { Identifier, Place } from "../../core";

/**
 * Represents a JSX opening element in the IR.
 *
 * Examples:
 * - `<div className={x}>`
 * - `<MyComponent foo="bar" />`
 */
export class JSXOpeningElementInstruction extends JSXInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly tag: string,
    public readonly tagPlace: Place | undefined,
    public readonly attributes: Place[],
    public readonly selfClosing: boolean,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): JSXOpeningElementInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      JSXOpeningElementInstruction,
      place,
      this.nodePath,
      this.tag,
      this.tagPlace,
      this.attributes,
      this.selfClosing,
    );
  }

  public rewrite(values: Map<Identifier, Place>): BaseInstruction {
    return new JSXOpeningElementInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.tag,
      this.tagPlace
        ? (values.get(this.tagPlace.identifier) ?? this.tagPlace)
        : undefined,
      this.attributes.map((attr) => values.get(attr.identifier) ?? attr),
      this.selfClosing,
    );
  }

  public getReadPlaces(): Place[] {
    return [...(this.tagPlace ? [this.tagPlace] : []), ...this.attributes];
  }

  public get isPure(): boolean {
    return true;
  }
}
