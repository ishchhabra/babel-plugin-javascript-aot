import { NodePath } from "@babel/core";
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
 * Represents a memory instruction that stores a value at a given place.
 *
 * @example
 * ```typescript
 * const x = 5;
 * ```
 */
export class StoreLocalInstruction extends MemoryInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly lval: Place,
    public readonly value: Place,
    public readonly type: "let" | "const" | "var",
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): StoreLocalInstruction {
    const identifier = createIdentifier(environment);
    const place = createPlace(identifier, environment);
    const instructionId = createInstructionId(environment);
    return new StoreLocalInstruction(
      instructionId,
      place,
      this.nodePath,
      this.lval,
      this.value,
      this.type,
    );
  }

  rewriteInstruction(values: Map<Identifier, Place>): StoreLocalInstruction {
    return new StoreLocalInstruction(
      this.id,
      this.place,
      this.nodePath,
      this.lval,
      values.get(this.value.identifier) ?? this.value,
      this.type,
    );
  }

  getReadPlaces(): Place[] {
    return [this.value];
  }

  public get isPure(): boolean {
    return true;
  }
}
