import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { InstructionId, MemoryInstruction } from "../../base";
import { Identifier, Place } from "../../core";

export class LoadPhiInstruction extends MemoryInstruction {
  constructor(
    public readonly id: InstructionId,
    public readonly place: Place,
    public readonly nodePath: NodePath<t.Node> | undefined,
    public readonly value: Place,
  ) {
    super(id, place, nodePath);
  }

  rewriteInstruction(values: Map<Identifier, Place>): LoadPhiInstruction {
    return new LoadPhiInstruction(
      this.id,
      this.place,
      this.nodePath,
      values.get(this.value.identifier) ?? this.value,
    );
  }

  getReadPlaces(): Place[] {
    return [this.value];
  }

  public get isPure(): boolean {
    return true;
  }
}
