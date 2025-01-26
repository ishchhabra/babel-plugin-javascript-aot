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
 * An instruction that loads a **static** property for an object:
 * `object[0]` or `object.foo`.
 */
export class LoadPropertyInstruction extends MemoryInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly object: Place,
    public readonly property: string,
  ) {
    super(id, place, nodePath);
  }

  public clone(environment: Environment): LoadPropertyInstruction {
    const identifier = createIdentifier(environment);
    const place = createPlace(identifier, environment);
    const instructionId = createInstructionId(environment);
    return new LoadPropertyInstruction(
      instructionId,
      place,
      this.nodePath,
      this.object,
      this.property,
    );
  }

  rewriteInstruction(values: Map<Identifier, Place>): LoadPropertyInstruction {
    return new LoadPropertyInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.object.identifier) ?? this.object,
      this.property,
    );
  }

  getReadPlaces(): Place[] {
    return [this.object];
  }

  public get isPure(): boolean {
    return false;
  }
}
