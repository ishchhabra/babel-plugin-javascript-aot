import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import { Environment } from "../../../environment";
import { InstructionId, MemoryInstruction } from "../../base";
import { Identifier, Place } from "../../core";
import { createInstructionId } from "../../utils";

/**
 * Represents a memory instruction that copies the value of one place to another.
 *
 * For example, Copy(lval: x, value: y) means that the value at place y is copied to x.
 */
export class CopyInstruction extends MemoryInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly lval: Place,
    public readonly value: Place,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): CopyInstruction {
    const identifier = environment.createIdentifier();
    const place = environment.createPlace(identifier);
    const instructionId = createInstructionId(environment);
    return new CopyInstruction(
      instructionId,
      place,
      this.nodePath,
      this.lval,
      this.value,
    );
  }

  rewriteInstruction(values: Map<Identifier, Place>): CopyInstruction {
    return new CopyInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.lval.identifier) ?? this.lval,
      values.get(this.value.identifier) ?? this.value,
    );
  }

  getReadPlaces(): Place[] {
    return [this.lval, this.value];
  }

  public get isPure(): boolean {
    return true;
  }
}
