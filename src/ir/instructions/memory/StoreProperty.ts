import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { InstructionId, MemoryInstruction } from "../../base";
import { Identifier, Place } from "../../core";
import {
  createIdentifier,
  createInstructionId,
  createPlace,
} from "../../utils";

/**
 * An instruction that stores a value into a **static** property for an object:
 * `object[0]` or `object.foo`.
 */
export class StorePropertyInstruction extends MemoryInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly object: Place,
    public readonly property: string,
    public readonly value: Place,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): StorePropertyInstruction {
    const identifier = createIdentifier(environment);
    const place = createPlace(identifier, environment);
    const instructionId = createInstructionId(environment);
    return new StorePropertyInstruction(
      instructionId,
      place,
      this.nodePath,
      this.object,
      this.property,
      this.value,
    );
  }

  rewriteInstruction(values: Map<Identifier, Place>): StorePropertyInstruction {
    return new StorePropertyInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.object.identifier) ?? this.object,
      this.property,
      values.get(this.value.identifier) ?? this.value,
    );
  }

  getReadPlaces(): Place[] {
    return [this.object, this.value];
  }

  public get isPure(): boolean {
    return false;
  }
}
