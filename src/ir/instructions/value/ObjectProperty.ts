import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { BaseInstruction, InstructionId, ValueInstruction } from "../../base";
import { Identifier, Place } from "../../core";
import { createInstructionId } from "../../utils";

/**
 * Represents an object property in the IR.
 *
 * Examples:
 * - `{ x: 1, y: 2 } // `x: 1` and `y: 2` are the object properties
 */
export class ObjectPropertyInstruction extends ValueInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly key: Place,
    public readonly value: Place,
    public readonly computed: boolean,
    public readonly shorthand: boolean,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): ObjectPropertyInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instructionId = createInstructionId(environment);
    return new ObjectPropertyInstruction(
      instructionId,
      place,
      this.nodePath,
      this.key,
      this.value,
      this.computed,
      this.shorthand,
    );
  }

  rewriteInstruction(values: Map<Identifier, Place>): BaseInstruction {
    return new ObjectPropertyInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.key.identifier) ?? this.key,
      values.get(this.value.identifier) ?? this.value,
      this.computed,
      this.shorthand,
    );
  }

  getReadPlaces(): Place[] {
    return [this.key, this.value];
  }
}
