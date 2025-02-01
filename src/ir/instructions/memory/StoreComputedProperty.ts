import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { InstructionId, MemoryInstruction } from "../../base";
import { Identifier, Place } from "../../core";

/**
 * An instruction that stores a value into a **dynamic** property for an object:
 * `object[property]`.
 */
export class StoreDynamicPropertyInstruction extends MemoryInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly object: Place,
    public readonly property: Place,
    public readonly value: Place,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): StoreDynamicPropertyInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    return environment.createInstruction(
      StoreDynamicPropertyInstruction,
      place,
      this.nodePath,
      this.object,
      this.property,
      this.value,
    );
  }

  rewrite(values: Map<Identifier, Place>): StoreDynamicPropertyInstruction {
    return new StoreDynamicPropertyInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.object.identifier) ?? this.object,
      values.get(this.property.identifier) ?? this.property,
      values.get(this.value.identifier) ?? this.value,
    );
  }

  getReadPlaces(): Place[] {
    return [this.object, this.property, this.value];
  }

  public get isPure(): boolean {
    return false;
  }
}
