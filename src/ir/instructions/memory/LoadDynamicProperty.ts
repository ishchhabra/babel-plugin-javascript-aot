import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { InstructionId, MemoryInstruction } from "../../base";
import { Identifier, Place } from "../../core";

/**
 * An instruction that loads a **dynamic** property for an object:
 * `object[property]`.
 */
export class LoadDynamicPropertyInstruction extends MemoryInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly object: Place,
    public readonly property: Place,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): LoadDynamicPropertyInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      LoadDynamicPropertyInstruction,
      place,
      this.nodePath,
      this.object,
      this.property,
    );
  }

  rewrite(values: Map<Identifier, Place>): LoadDynamicPropertyInstruction {
    return new LoadDynamicPropertyInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.object.identifier) ?? this.object,
      values.get(this.property.identifier) ?? this.property,
    );
  }

  getReadPlaces(): Place[] {
    return [this.object, this.property];
  }

  public get isPure(): boolean {
    return false;
  }
}
